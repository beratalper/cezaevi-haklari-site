import { cezaeviKategorileri } from "@/data/cezaeviKategorileri";
import kararlar from "@/data/kararlar.json";

export default function KonularPage() {
  const temizle = (s) => (s || "").toLocaleLowerCase("tr-TR").trim();

  const kategoriIstatistikleri = cezaeviKategorileri.map((kategori) => {
    const liste = kararlar.filter((x) =>
      (x.mudahale_iddiasi_aym || "").includes(kategori.aymBaslik)
    );

    const ihlal = liste.filter((x) =>
      temizle(x.sonuc_aym || x.sonuc).includes("ihlal")
    ).length;

    const oran = liste.length ? ((ihlal / liste.length) * 100).toFixed(1) : "0.0";

    return {
      ...kategori,
      toplam: liste.length,
      ihlal,
      oran,
    };
  });
  const haklar = [
    ["Telefon Hakkı", "/konular/telefon-hakki"],
    ["Görüş Hakkı", "/konular/gorus-hakki"],
    ["Mektup ve Haberleşme", "/konular/mektup-hakki"],
    ["Sağlık Hakkı", "/konular/saglik-hakki"],
    ["Disiplin Cezaları", "/konular/disiplin-cezalari"],
    ["Nakil Talebi", "/konular/nakil-hakki"],
    ["Açık Cezaevi", "/konular/acik-cezaevi"],
    ["İnfaz Hâkimliği", "/konular/infaz-hakimligi"],
  ];

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
            Cezaevi Hakları
          </p>

          <h1 className="font-serif text-5xl font-semibold tracking-tight md:text-7xl">
            Haklar
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Ceza infaz kurumlarında tutuklu ve hükümlülerin en çok karşılaştığı
            hak başlıklarını inceleyin.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {haklar.map(([title, href]) => (
              <a
                key={title}
                href={href}
                className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:-translate-y-1 hover:border-[#c9a96e]/50 hover:bg-white/[0.07]"
              >
                <div className="mb-6 h-1 w-12 rounded-full bg-[#c9a96e]" />
                <h2 className="font-serif text-2xl font-semibold group-hover:text-[#d9bd83]">
                  {title}
                </h2>
                <div className="mt-6 text-sm font-semibold text-[#d9bd83]">
                  İncele →
                </div>
              </a>
            ))}
          </div>

          <div className="mt-24">
            <h2 className="font-serif text-4xl font-semibold">
              AYM Karar Kategorileri
            </h2>

            <p className="mt-4 max-w-3xl text-slate-300">
              Anayasa Mahkemesi bireysel başvuru kararlarında ceza infaz
              kurumlarına ilişkin resmi müdahale iddiası kategorileri.
            </p>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {kategoriIstatistikleri.map((item) => (
                <a
                  key={item.id}
                  href={`/kategori/${item.slug}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#c9a96e]/50 hover:bg-white/[0.06]"
                >
                  <div className="text-xs tracking-widest text-[#c9a96e] mb-2">
                    #{item.id}
                  </div>

                  <div className="text-lg font-semibold leading-7">
                    {item.baslik}
                  </div>

<div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
  <div className="rounded-xl bg-white/[0.05] p-2">
    <div className="text-slate-400">Karar</div>
    <div className="mt-1 font-semibold text-white">{item.toplam}</div>
  </div>

  <div className="rounded-xl bg-white/[0.05] p-2">
    <div className="text-slate-400">İhlal</div>
    <div className="mt-1 font-semibold text-white">{item.ihlal}</div>
  </div>

  <div className="rounded-xl bg-white/[0.05] p-2">
    <div className="text-slate-400">Oran</div>
    <div className="mt-1 font-semibold text-white">%{item.oran}</div>
  </div>
</div>

                  <div className="mt-4 text-sm text-[#d9bd83]">
                    Kararları Gör →
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}