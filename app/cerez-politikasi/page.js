export const metadata = {
  title: "Çerez Politikası | Cezaevi Hakları",
  description:
    "Cezaevi Hakları internet sitesinin çerez kullanım politikası.",
};

export default function CerezPolitikasiPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20 text-white">
      <h1 className="text-4xl font-bold text-amber-300">
        Çerez Politikası
      </h1>

      <div className="mt-10 space-y-8 text-slate-300 leading-8">
        <p>
          Bu internet sitesi kullanıcı deneyimini geliştirmek, site trafiğini
          analiz etmek ve reklam hizmetleri sunmak amacıyla çerezler
          kullanmaktadır.
        </p>

        <p>
          Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcınız
          aracılığıyla cihazınıza kaydedilen küçük veri dosyalarıdır.
        </p>

        <h2 className="text-2xl font-semibold text-white">
          Kullanılan Çerez Türleri
        </h2>

        <ul className="list-disc pl-6 space-y-3">
          <li>Zorunlu çerezler</li>
          <li>Performans ve analiz çerezleri</li>
          <li>Reklam ve kişiselleştirme çerezleri</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white">
          Google Reklamları
        </h2>

        <p>
          Sitemizde Google AdSense reklam hizmetleri kullanılabilir. Google,
          kullanıcıların ilgi alanlarına göre reklam gösterebilmek amacıyla
          çerezlerden yararlanabilir.
        </p>

        <p>
          Kullanıcılar tarayıcı ayarlarından çerezleri silebilir veya
          engelleyebilir.
        </p>

        <h2 className="text-2xl font-semibold text-white">
          İletişim
        </h2>

        <p>
          Çerez politikası hakkında sorularınız için iletişim sayfamız üzerinden
          bize ulaşabilirsiniz.
        </p>
      </div>
    </main>
  );
}