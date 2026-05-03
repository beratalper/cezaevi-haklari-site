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

export default async function KararDetay({ params }) {
  const { slug } = await params;

  const item = await getKarar(slug);

  if (!item) {
    return (
      <main className="min-h-screen bg-[#070b14] p-10 text-white">
        Karar bulunamadı
      </main>
    );
  }

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

      <h1 className="text-center text-4xl font-semibold leading-tight md:text-5xl">
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
              {item.ai_basvuru_konusu || item.basvuru_konusu || "Bilgi bulunamadı"}
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

          {item?.basvuru_no && (
            <div className="mt-6 flex justify-end">
              <a
                href={`https://kararlarbilgibankasi.anayasa.gov.tr/BB/${item.basvuru_no}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#c9a96e]/70 bg-[#c9a96e]/10 px-5 py-2.5 text-sm font-semibold text-[#f3d99b] transition hover:-translate-y-0.5 hover:bg-[#c9a96e]/20"
              >
                Kararın tam metni →
              </a>
            </div>
          )}

          <BilgilendirmeAlani />
        </div>
      </div>
    </main>
  );
}