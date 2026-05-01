export const metadata = {
  title: "Hakkımızda | Cezaevi Hakları",
  description: "Cezaevi Hakları sitesi hakkında bilgilendirme.",
};

export default function HakkimizdaPage() {
  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-5xl font-semibold">Hakkımızda</h1>

        <div className="mt-8 space-y-5 text-sm leading-7 text-slate-300">
          <p>
            Cezaevi Hakları, öncelikle ve özellikle ceza infaz kurumlarında yaşanan hak ihlalleri,
            tutuklu ve hükümlü hakları ile Anayasa Mahkemesi bireysel başvuru
            kararları hakkında sade ve anlaşılır bilgiler sunmayı amaçlayan
            bağımsız bir bilgilendirme sitesidir.
          </p>

          <p>
            Sitede yer alan içerikler, Anayasa Mahkemesi bireysel başvuru kararları ve kamuya
            açık hukuki kaynaklar esas alınarak hazırlanır. Amaç, vatandaşların
            hak arama süreçlerini daha iyi anlamalarına yardımcı olmaktır.
          </p>

          <p>
            Bu sitedeki bilgiler genel bilgilendirme niteliğindedir; avukatlık
            hizmeti veya hukuki danışmanlık yerine geçmez.
          </p>
        </div>
      </div>
    </main>
  );
}