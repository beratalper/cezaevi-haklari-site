const konular = [
  "Telefon hakkı şikâyeti",
  "Görüş yasağı itirazı",
  "Disiplin cezasına şikâyet",
  "Sağlık sevki sorunları",
  "Nakil talebinin reddi",
  "Mektup sansürü",
  "İyi hâl kararları",
  "Açık cezaevi işlemleri",
];

const dayanaklar = [
  "4675 Sayılı İnfaz Hâkimliği Kanunu",
  "5275 Sayılı Kanun",
  "Anayasa Madde 40",
  "Etkili Başvuru Hakkı",
  "AYM İçtihatları",
];

export const metadata = {
  title: "İnfaz Hâkimliği Başvurusu | Cezaevi Hakları",
  description:
    "İnfaz hâkimliği nedir, hangi konularda başvuru yapılır, cezaevi işlemlerine karşı şikâyet yolları.",
};

export default function InfazHakimligiPage() {
  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-[#101827] to-[#070b14]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-5 inline-flex rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-4 py-2 text-sm font-semibold text-[#c9a96e]">
            Haklara Göre Mevzuat
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            İnfaz Hâkimliği Başvurusu
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Cezaevi idaresinin işlem ve kararlarına karşı en temel iç hukuk
            başvuru yollarından biri infaz hâkimliği şikâyet mekanizmasıdır.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="text-2xl font-bold text-[#c9a96e]">
              Hangi Konularda Başvurulur?
            </h2>

            <div className="mt-6 space-y-3">
              {konular.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0d1320] p-8">
            <h2 className="text-2xl font-bold text-[#c9a96e]">
              Dayanak Mevzuat
            </h2>

            <div className="mt-6 space-y-3">
              {dayanaklar.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 p-8">
          <h2 className="text-2xl font-bold text-[#c9a96e]">
            Önemli Not
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-200">
            Başvurularda süreler ve somut olayın özellikleri önemlidir.
            Gerekçeli ve belgeli başvurular daha etkili sonuç verebilir.
          </p>
        </div>
      </section>
    </main>
  );
}