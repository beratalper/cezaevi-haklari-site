import data from "@/data/kararlar.json";
import { cezaeviKategorileri } from "@/data/cezaeviKategorileri";
import Link from "next/link";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const kategori = cezaeviKategorileri.find((x) => x.slug === slug);

  if (!kategori) {
    return {
      title: "Kategori bulunamadı | Cezaevi Hakları",
    };
  }

  return {
    title: `${kategori.baslik} AYM Kararları | Cezaevi Hakları`,
    description: `Anayasa Mahkemesinin ${kategori.baslik} müdahale iddiasına ilişkin bireysel başvuru kararları, ihlal sonuçları ve karar listesi.`,
  };
}
export default async function Page({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;

  const kategori = cezaeviKategorileri.find((x) => x.slug === slug);

  if (!kategori) {
    return (
      <main className="min-h-screen bg-[#070b14] px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <h1 className="font-serif text-4xl font-semibold">Kategori bulunamadı</h1>
          <p className="mt-4 text-slate-400">Aradığınız kategori mevcut değil.</p>
        </div>
      </main>
    );
  }

  const q = (sp?.q || "").toLocaleLowerCase("tr-TR");
  const page = Number(sp?.page || 1);
  const perPage = 20;

  let kararlar = data.filter((x) =>
    (x.mudahale_iddiasi_aym || "").includes(kategori.aymBaslik)
  );

  if (q) {
    kararlar = kararlar.filter((x) =>
      `${x.baslik || ""} ${x.basvuru_no || ""} ${x.konu || ""} ${x.hak_ozgurluk_aym || ""} ${x.mudahale_iddiasi_aym || ""} ${x.sonuc_aym || ""}`
        .toLocaleLowerCase("tr-TR")
        .includes(q)
    );
  }

  const ihlalSayisi = kararlar.filter((x) =>
    (x.sonuc_aym || x.sonuc || "")
      .toLocaleLowerCase("tr-TR")
      .includes("ihlal")
  ).length;

  const ihlalOrani = kararlar.length
    ? ((ihlalSayisi / kararlar.length) * 100).toFixed(2)
    : "0.00";

  const totalPages = Math.max(1, Math.ceil(kararlar.length / perPage));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const visible = kararlar.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm font-semibold text-[#d9bd83]">
  <Link href="/konular" className="hover:text-white">
    ← Konular
  </Link>
  <span>AYM Müdahale İddiası Kategorisi #{kategori.id}</span>
</div>

          <h1 className="font-serif text-4xl font-semibold">{kategori.baslik}</h1>

          <p className="mt-4 max-w-3xl leading-7 text-slate-400">
            Bu kategoride {kararlar.length} karar listeleniyor. İhlal içeren karar:
            {" "}
            {ihlalSayisi}. İhlal oranı: %{ihlalOrani}.
          </p>

<p className="mt-3 text-sm text-slate-500">
  Resmi AYM müdahale iddiası başlığı:{" "}
  <span className="text-slate-300">{kategori.aymBaslik}</span>
</p>

          <form className="mt-8 flex flex-col gap-3 md:flex-row">
            <input
              name="q"
              defaultValue={sp?.q || ""}
              placeholder="Bu kategoride ara..."
              className="min-h-12 flex-1 rounded-2xl bg-white px-5 text-slate-900 outline-none"
            />
            <button className="rounded-2xl bg-[#c9a96e] px-7 py-3 font-semibold text-[#08111f] hover:bg-[#e0bf7a]">
              Ara
            </button>
          </form>
        </div>

        <div className="grid gap-5">
          {visible.map((item) => (
            <Link
              key={item.basvuru_no}
              href={`/kararlar/${item.basvuru_no.replace("/", "-")}`}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#c9a96e]/60 hover:bg-white/[0.08]"
            >
              <div className="mb-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-[#c9a96e]/15 px-3 py-1 text-[#e7c98d]">
                  {kategori.baslik}
                </span>
                {item.sonuc_aym && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-slate-300">
                    {item.sonuc_aym}
                  </span>
                )}
              </div>

              <h2 className="font-serif text-2xl font-semibold transition group-hover:text-[#e7c98d]">
                {item.baslik}
              </h2>

              {item.konu && (
                <p className="mt-4 line-clamp-3 leading-7 text-slate-400">
                  {item.konu}
                </p>
              )}

              <div className="mt-5 text-sm text-slate-500">
                {item.basvuru_no} • {item.karar_tarihi}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <Link
            href={`/kategori/${slug}?q=${encodeURIComponent(sp?.q || "")}&page=${Math.max(
              1,
              currentPage - 1
            )}`}
            className={`rounded-2xl border border-white/10 px-5 py-3 text-sm ${
              currentPage === 1
                ? "pointer-events-none opacity-40"
                : "hover:border-[#c9a96e]/60"
            }`}
          >
            ← Önceki
          </Link>

          <div className="text-sm text-slate-400">
            Sayfa {currentPage} / {totalPages}
          </div>

          <Link
            href={`/kategori/${slug}?q=${encodeURIComponent(sp?.q || "")}&page=${Math.min(
              totalPages,
              currentPage + 1
            )}`}
            className={`rounded-2xl border border-white/10 px-5 py-3 text-sm ${
              currentPage === totalPages
                ? "pointer-events-none opacity-40"
                : "hover:border-[#c9a96e]/60"
            }`}
          >
            Sonraki →
          </Link>
        </div>
      </div>
    </main>
  );
}