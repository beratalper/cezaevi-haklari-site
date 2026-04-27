const sections = [
  {
    title: "İşkenceye Karşı Sözleşme Nedir?",
    text: "Birleşmiş Milletler İşkenceye ve Diğer Zalimane, İnsanlık Dışı veya Aşağılayıcı Muamele veya Cezaya Karşı Sözleşme, işkence ve kötü muamelenin mutlak olarak yasaklanmasına ilişkin temel uluslararası metinlerden biridir.",
  },
  {
    title: "Cezaevleri Açısından Önemi",
    text: "Ceza infaz kurumlarında darp, tehdit, çıplak arama, kötü muamele iddiaları, sağlık hizmetine erişimin engellenmesi ve etkili soruşturma yükümlülüğü bakımından önemli bir referans niteliğindedir.",
  },
  {
    title: "Başvuru ve Denetim Boyutu",
    text: "Sözleşme, kötü muamele iddialarının etkili biçimde incelenmesi ve sorumlular hakkında gerekli süreçlerin işletilmesi gerektiğini vurgulayan uluslararası bir çerçeve sunar.",
  },
];

const topics = [
  "İşkence yasağı",
  "Kötü muamele yasağı",
  "Etkili soruşturma",
  "Cezaevi güvenliği",
  "Sağlık hizmetleri",
  "Çıplak arama iddiaları",
  "Disiplin uygulamaları",
  "Başvuru yolları",
];

export const metadata = {
  title: "İşkenceye Karşı Sözleşme | Cezaevi Hakları",
  description:
    "BM İşkenceye Karşı Sözleşme hakkında Türkçe açıklamalar, cezaevi kötü muamele iddiaları ve başvuru yolları.",
};

export default function IskenceyeKarsiSozlesmePage() {
  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-[#101827] to-[#070b14]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-5 inline-flex rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-4 py-2 text-sm font-semibold text-[#c9a96e]">
            Uluslararası İnsan Hakları Metni
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            İşkenceye Karşı Sözleşme
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            İşkenceye Karşı Sözleşme, cezaevlerinde insan onuruyla bağdaşmayan
            muamelelerin önlenmesi, kötü muamele iddialarının incelenmesi ve
            etkili başvuru yollarının işletilmesi bakımından temel uluslararası
            metinlerden biridir.
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
          <h2 className="text-2xl font-bold">Cezaevi Haklarıyla İlgili Başlıklar</h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Sözleşme özellikle cezaevlerinde kötü muamele iddiaları, etkili
            soruşturma yükümlülüğü ve başvuru yollarının varlığı bakımından
            önemlidir.
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
          href="https://humanrightscenter.bilgi.edu.tr/media/uploads/2015/08/03/IskenceyeKarsiSozlesme.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-3xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 p-8 transition hover:border-[#c9a96e]/50"
        >
          <h2 className="text-2xl font-bold text-[#c9a96e]">
            Türkçe metne ulaş
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            Sözleşmenin Türkçe metnine buradan ulaşabilirsiniz.
          </p>
        </a>
      </section>
    </main>
  );
}