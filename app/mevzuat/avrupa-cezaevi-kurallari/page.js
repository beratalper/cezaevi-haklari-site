const sections = [
  {
    title: "Avrupa Cezaevi Kuralları Nedir?",
    text: "Avrupa Cezaevi Kuralları, Avrupa Konseyi Bakanlar Komitesi tarafından kabul edilen ve ceza infaz kurumlarında insan haklarına uygun standartları ortaya koyan tavsiye niteliğinde bir metindir.",
  },
  {
    title: "Hangi Konuları Kapsar?",
    text: "Kurallar; barınma, hijyen, sağlık, disiplin, güvenlik, aileyle temas, avukatla görüşme, denetim, personel eğitimi ve bağımsız izleme gibi birçok başlığı kapsar.",
  },
  {
    title: "Neden Önemlidir?",
    text: "Cezaevindeki uygulamaların yalnızca iç hukukla değil, Avrupa insan hakları standartlarıyla da uyumlu olup olmadığını değerlendirmek için önemli bir referans sağlar.",
  },
];

const topics = [
  "İnsan onuru",
  "Sağlık hizmetleri",
  "Aileyle temas",
  "Avukatla görüşme",
  "Disiplin işlemleri",
  "Bağımsız denetim",
  "Hijyen ve barınma",
  "Personel eğitimi",
];

export const metadata = {
  title: "Avrupa Cezaevi Kuralları | Cezaevi Hakları",
  description:
    "Avrupa Cezaevi Kuralları hakkında Türkçe açıklamalar, cezaevi hakları ve uluslararası standartlar.",
};

export default function AvrupaCezaeviKurallariPage() {
  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-[#101827] to-[#070b14]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-5 inline-flex rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-4 py-2 text-sm font-semibold text-[#c9a96e]">
            Avrupa Konseyi Standartları
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            Avrupa Cezaevi Kuralları
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Avrupa Cezaevi Kuralları, ceza infaz kurumlarının insan onuruna,
            temel haklara ve bağımsız denetime uygun şekilde işletilmesine
            ilişkin Avrupa standartlarını ortaya koyar.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"
            >
              <h2 className="text-xl font-bold text-[#c9a96e]">
                {section.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                {section.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-[#0d1320] p-8">
          <h2 className="text-2xl font-bold">Öne Çıkan Başlıklar</h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Güncellenmiş Avrupa Cezaevi Kuralları, Avrupa Konseyi tarafından
            Türkçeye çevrilmiştir. Bu metin, özellikle cezaevlerinin bağımsız
            izlenmesi ve mahpusların temel haklarına saygı bakımından önemlidir.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map((topic) => (
              <div
                key={topic}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-slate-200"
              >
                {topic}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <a
          href="https://rm.coe.int/1680a0a153"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-3xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 p-8 transition hover:border-[#c9a96e]/50"
        >
          <h2 className="text-2xl font-bold text-[#c9a96e]">
            Türkçe metne ulaş
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            Avrupa Konseyi tarafından yayımlanan Türkçe çeviri metne buradan
            ulaşabilirsiniz.
          </p>
        </a>
      </section>
    </main>
  );
}