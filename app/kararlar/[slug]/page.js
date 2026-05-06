import ReportClassificationButton from "../../../components/ReportClassificationButton";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getKarar(slug) {
  try {
    const headerList = await headers();
    const host = headerList.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";

    const res = await fetch(`${protocol}://${host}/api/kararlar/${slug}`, {
      cache: "no-store",
    });

    const json = await res.json();

    if (!json.ok) {
      console.error("Karar API hata:", {
        slug,
        host,
        error: json.error,
      });
      return null;
    }

    return json.data;
  } catch (error) {
    console.error("Karar detay fetch hatası:", error);
    return null;
  }
}

async function getBenzerKararlar(slug) {
  try {
    const headerList = await headers();
    const host = headerList.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";

    const res = await fetch(`${protocol}://${host}/api/kararlar/${slug}/benzer`, {
      cache: "no-store",
    });

    const json = await res.json();

    if (!json.ok) return [];

    return json.data || [];
  } catch (error) {
    console.error("Benzer kararlar fetch hatası:", error);
    return [];
  }
}

function BilgilendirmeAlani() {
  return (
    <div className="mt-8 mb-10">
      <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex justify-center">
        <img
          src="/logo.png"
          alt="Cezaevi Hakları"
          className="max-h-40 w-auto opacity-80"
        />
      </div>
    </div>
  );
}

function BenzerKararlar({ item, kararlar }) {
  if (!kararlar || kararlar.length === 0) return null;

  const kategoriBasligi =
    item.alt_kategori && item.alt_kategori !== item.ust_kategori
      ? `${item.ust_kategori} / ${item.alt_kategori}`
      : item.alt_kategori || item.ust_kategori;

  const baslik = kategoriBasligi
    ? `${kategoriBasligi} ile ilgili diğer kararlar`
    : "Benzer kararlar";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
        {baslik}
      </h3>

      <div className="mt-4 space-y-3">
        {kararlar.map((karar) => (
          <a
            key={karar.id}
            href={`/kararlar/${karar.slug || karar.basvuru_no.replace("/", "-")}`}
            className="block rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#c9a96e]/50 hover:bg-white/[0.06]"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div className="text-sm font-medium text-slate-100">
                {karar.karar_adi}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2 text-xs text-slate-400 md:justify-end">
                <span>Başvuru No: {karar.basvuru_no}</span>

                {karar.karar_tarihi && (
                  <span>Karar Tarihi: {karar.karar_tarihi}</span>
                )}
              </div>
            </div>

            {karar.basvuru_konusu && (
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {karar.basvuru_konusu}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

function IcLinklemeAlani({ item }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
        Benzer kararlar ve ilgili konular
      </h3>

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href="/kararlar?etiket=kotu-muamele"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition hover:border-[#c9a96e]/50 hover:text-[#f3d99b]"
        >
          Kötü muamele kararları
        </a>

        <a
          href="/kararlar?etiket=saglik-hakki"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition hover:border-[#c9a96e]/50 hover:text-[#f3d99b]"
        >
          Sağlık hakkı kararları
        </a>

        <a
          href="/kararlar?etiket=cezaevi"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition hover:border-[#c9a96e]/50 hover:text-[#f3d99b]"
        >
          Cezaevi kararları
        </a>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await getKarar(slug);
  const benzerKararlar = await getBenzerKararlar(slug);

  if (!item) {
    return {
      title: "Karar bulunamadı | Cezaevi Hakları",
      description: "Aranan Anayasa Mahkemesi kararı bulunamadı.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const basvuruNoSlug = item.basvuru_no?.replace("/", "-");

  const title = `${item.karar_adi} | AYM Kararı`;

  const description =
    item.ai_karar_ozeti ||
    item.basvuru_konusu ||
    item.ai_basvuru_konusu ||
    `${item.karar_adi} başvurusu hakkında Anayasa Mahkemesi kararı.`;

  return {
    title,
    description: description.slice(0, 160),

    alternates: {
      canonical: `https://cezaevihaklari.com/kararlar/${slug}`,
    },

    openGraph: {
      title,
      description: description.slice(0, 160),
      url: `https://cezaevihaklari.com/kararlar/${slug}`,
      siteName: "Cezaevi Hakları",
      type: "article",
    },
  };
}

export default async function KararDetay({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const adminSecret = sp?.secret;
  const adminYetkili = adminSecret === process.env.ADMIN_SECRET;

  const item = await getKarar(slug);
  const benzerKararlar = await getBenzerKararlar(slug);

  if (!item) {
    return (
      <main className="min-h-screen bg-[#070b14] p-10 text-white">
        Karar bulunamadı
      </main>
    );
  }

  const mailBody = encodeURIComponent(`
Merhaba,

Bu kararın cezaevi hak ihlali kapsamında olmadığını düşünüyorum.

Karar: ${item.karar_adi}
Başvuru No: ${item.basvuru_no}
Sayfa: https://cezaevihaklari.com/kararlar/${item.basvuru_no.replace("/", "-")}

Teşekkürler.
`);

  const subject = encodeURIComponent("Yanlış kategori bildirimi");

  return (
    <main className="min-h-screen bg-[#070b14] p-10 text-white">
      <a href="/kararlar" className="text-slate-400">
        ← Kararlara dön
      </a>

      <div className="mb-6 flex justify-center">
        <img
          src="/logo.png"
          alt="Cezaevi Hakları"
          className="max-h-20 w-auto opacity-80"
        />
      </div>

      <h1 className="text-center text-4xl font-semibold">
        {item.karar_adi}
      </h1>

      <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-400">
        <div className="rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-3 py-1 text-[#d9bd83]">
          Başvuru No: <span className="text-white">{item.basvuru_no}</span>
        </div>

        {item.karar_tarihi && (
          <div className="rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-3 py-1 text-[#d9bd83]">
            Karar Tarihi:{" "}
            <span className="text-white">{item.karar_tarihi}</span>
          </div>
        )}
      </div>

      <div className="mt-12 flex justify-center">
        <div className="w-full max-w-4xl space-y-6">

          <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
              Başvuru konusu
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {item.basvuru_konusu || item.ai_basvuru_konusu || "Bilgi bulunamadı"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
              Karar özeti
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {item.ai_karar_ozeti || "Bilgi bulunamadı"}
            </p>
          </div>

          <BilgilendirmeAlani />

          <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
              Bu karar neden önemli?
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {item.ai_neden_onemli || "Bilgi bulunamadı"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
              Benzer başvurularda nelere dikkat edilmeli?
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {item.ai_benzer_basvuruda_dikkat || "Bilgi bulunamadı"}
            </p>
          </div>

          <div className="mt-6 flex flex-col items-end gap-3">

            {/* Yanlış sınıflandırma */}
            <div className="w-full max-w-xs">
              <ReportClassificationButton item={item} />
              {adminYetkili && (
                <a
                  href={`/admin/siniflandirma/${item.basvuru_no.replace("/", "-")}?secret=${process.env.ADMIN_SECRET}`}
                  className="mt-2 block rounded-lg border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-center text-xs font-semibold text-amber-300 transition hover:bg-amber-300/20"
                >
                  Sınıflandırmayı düzelt
                </a>
              )}

              <p className="mt-1 text-xs text-slate-400 text-right">
                Kararın yanlış sınıflandırıldığını düşünüyorsanız bildirin.
              </p>
            </div>

            {/* Kararın tam metni */}
            {item?.basvuru_no && (
              <a
                href={`https://kararlarbilgibankasi.anayasa.gov.tr/BB/${item.basvuru_no}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-xs inline-flex items-center justify-center gap-2 rounded-lg border border-[#c9a96e]/70 bg-[#c9a96e]/10 px-5 py-2.5 text-sm font-semibold text-[#f3d99b] transition hover:-translate-y-0.5 hover:bg-[#c9a96e]/20"
              >
                Kararın tam metni →
              </a>
            )}
          </div>

          <BilgilendirmeAlani />
          <BenzerKararlar item={item} kararlar={benzerKararlar} />
        </div>
      </div>
    </main>
  );
}