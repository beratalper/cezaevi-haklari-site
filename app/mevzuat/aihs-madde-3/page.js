const sections = [
  {
    title: "AİHS Madde 3 Nedir?",
    text: "Avrupa İnsan Hakları Sözleşmesi'nin 3. maddesi, hiç kimsenin işkenceye, insanlık dışı veya aşağılayıcı muamele ya da cezaya tabi tutulamayacağını düzenler. Bu hak mutlak niteliktedir.",
  },
  {
    title: "Cezaevleri Açısından Önemi",
    text: "Cezaevindeki kötü koşullar, darp iddiaları, aşırı kalabalık, sağlık hizmetinin verilmemesi, uzun süreli izolasyon ve aşağılayıcı uygulamalar Madde 3 kapsamında değerlendirilebilir.",
  },
  {
    title: "Başvuru Boyutu",
    text: "İhlal iddiası varsa öncelikle iç hukuk yolları tüketilmeli; sonrasında uygun koşullarda Anayasa Mahkemesi ve Avrupa İnsan Hakları Mahkemesi başvuruları gündeme gelebilir.",
  },
];

const examples = [
  "Darp ve fiziksel şiddet",
  "Aşırı kalabalık koğuş",
  "Hijyen eksikliği",
  "Tedavinin engellenmesi",
  "Uzun süreli tecrit",
  "Çıplak arama iddiaları",
  "Yetersiz beslenme",
  "Onur kırıcı muamele",
];

export const metadata = {
  title: "AİHS Madde 3 Rehberi | Cezaevi Hakları",
  description:
    "AİHS Madde 3 işkence yasağı, cezaevi koşulları ve kötü muamele iddiaları hakkında rehber.",
};

export default function AIHSMadde3Page() {
  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-[#101827] to-[#070b14]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-5 inline-flex rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-4 py-2 text-sm font-semibold text-[#c9a96e]">
            Avrupa İnsan Hakları Sözleşmesi
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            AİHS Madde 3 Rehberi
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            İşkence, insanlık dışı veya aşağılayıcı muamele yasağı cezaevlerinde
            en önemli insan hakları standartlarından biridir.
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
          <h2 className="text-2xl font-bold">Madde 3 Kapsamında Örnek Durumlar</h2>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {examples.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 p-8">
          <h2 className="text-2xl font-bold text-[#c9a96e]">
            Önemli Not
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            Her olumsuz cezaevi koşulu otomatik olarak Madde 3 ihlali anlamına
            gelmez. Somut olayın ağırlığı, sürekliliği ve etkileri birlikte
            değerlendirilir.
          </p>
        </div>
      </section>
    </main>
  );
}