const sections = [
  {
    title: "Mandela Kuralları Nedir?",
    text: "Mandela Kuralları, mahpuslara insan onuruna uygun muamele edilmesi için kabul edilen Birleşmiş Milletler standartlarıdır. Cezaevlerinde sağlık, güvenlik, disiplin, tecrit, haberleşme, avukat görüşü ve şikâyet hakkı gibi birçok konuda temel ilkeler içerir.",
  },
  {
    title: "Hukuki Niteliği",
    text: "Mandela Kuralları doğrudan bir kanun değildir. Ancak ceza infaz uygulamalarında insan hakları standartlarının yorumlanmasında önemli bir uluslararası referans metindir.",
  },
  {
    title: "Cezaevi Hakları Açısından Önemi",
    text: "Kötü muamele yasağı, sağlık hizmetlerine erişim, aile ile temas, disiplin cezalarının sınırları ve uzun süreli tecrit yasağı bakımından özellikle önemlidir.",
  },
];

const topics = [
  "İnsan onuruna saygı",
  "Ayrımcılık yasağı",
  "Sağlık hizmetlerine erişim",
  "Kötü muamele yasağı",
  "Uzun süreli tecrit yasağı",
  "Aileyle haberleşme",
  "Avukatla görüşme",
  "Şikâyet ve başvuru hakkı",
];

export const metadata = {
  title: "Mandela Kuralları | Cezaevi Hakları",
  description:
    "Mahpuslara Muameleye İlişkin Birleşmiş Milletler Nelson Mandela Kuralları hakkında Türkçe açıklamalar.",
};

export default function MandelaKurallariPage() {
  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-[#101827] to-[#070b14]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-5 inline-flex rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-4 py-2 text-sm font-semibold text-[#c9a96e]">
            Uluslararası Cezaevi Standartları
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            Nelson Mandela Kuralları
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Mahpuslara Muameleye İlişkin Birleşmiş Milletler Asgari Standart
            Kuralları, ceza infaz kurumlarında insan onuruna uygun muamele
            edilmesi için temel uluslararası ilkeleri ortaya koyar.
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
            Mandela Kuralları, cezaevindeki yaşam koşullarının yalnızca güvenlik
            ekseninde değil, insan hakları ve insan onuru temelinde
            değerlendirilmesi gerektiğini kabul eder.
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
        <div className="rounded-3xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 p-8">
          <h2 className="text-2xl font-bold text-[#c9a96e]">
            Not
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            Bu sayfa, Mandela Kuralları hakkında genel bilgilendirme amacıyla
            hazırlanmıştır. Kurallar doğrudan bir kanun metni olmamakla birlikte,
            cezaevi koşulları ve mahpus hakları değerlendirilirken önemli bir
            uluslararası standart olarak dikkate alınır.
          </p>
        </div>
      </section>
    </main>
  );
}