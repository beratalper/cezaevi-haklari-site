export const metadata = {
  title: "Yasal Uyarı | Cezaevi Hakları",
  description: "Cezaevi Hakları yasal uyarı metni.",
};

export default function YasalUyariPage() {
  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-5xl font-semibold">Yasal Uyarı</h1>

        <div className="mt-8 space-y-5 text-sm leading-7 text-slate-300">
          <p>
            Bu sitede yer alan tüm içerikler genel bilgilendirme amacıyla
            hazırlanmıştır. İçerikler hukuki danışmanlık, avukatlık hizmeti veya
            kesin hukuki görüş niteliği taşımaz.
          </p>

          <p>
            Her hukuki olay kendi özel koşulları içinde değerlendirilmelidir.
            Bu nedenle sitedeki bilgilerden hareketle işlem yapmadan önce bir
            avukattan veya yetkili mercilerden profesyonel destek alınması
            önerilir.
          </p>

          <p>
            Sitede yer alan Anayasa Mahkemesi kararlarına ilişkin özet ve
            açıklamalar, kararların daha anlaşılır hale getirilmesi amacıyla
            hazırlanmıştır. Esas alınması gereken metin, ilgili kararın resmî
            metnidir.
          </p>

          <p>
            Cezaevi Hakları, içeriklerin kullanımından doğabilecek doğrudan veya
            dolaylı sonuçlardan sorumlu tutulamaz.
          </p>
        </div>
      </div>
    </main>
  );
}