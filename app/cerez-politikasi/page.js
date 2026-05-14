export const metadata = {
  title: "Çerez Politikası | Cezaevi Hakları",
  description:
    "Cezaevi Hakları internet sitesinin çerez kullanım politikası.",
};

export default function CerezPolitikasiPage() {
  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-24 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur-xl">
          <div className="mb-10">
            <div className="mb-4 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1 text-sm font-semibold text-amber-300">
              Yasal Bilgilendirme
            </div>

            <h1 className="text-5xl font-semibold leading-tight text-white">
              Çerez Politikası
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Bu internet sitesi kullanıcı deneyimini geliştirmek,
              performans analizi yapmak ve reklam hizmetleri sunmak amacıyla
              çerezler kullanmaktadır.
            </p>
          </div>

          <div className="space-y-10 text-[17px] leading-8 text-slate-300">
            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">
                Çerez Nedir?
              </h2>

              <p>
                Çerezler, ziyaret ettiğiniz internet siteleri tarafından
                tarayıcınız aracılığıyla cihazınıza kaydedilen küçük veri
                dosyalarıdır.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">
                Kullanılan Çerez Türleri
              </h2>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-lg font-semibold text-amber-300">
                    Zorunlu
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Sitenin temel işlevlerinin çalışabilmesi için gerekli
                    çerezlerdir.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-lg font-semibold text-amber-300">
                    Analiz
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Site performansını ve kullanıcı deneyimini analiz etmek için
                    kullanılır.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-lg font-semibold text-amber-300">
                    Reklam
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Google AdSense gibi reklam hizmetleri kapsamında
                    kullanılabilir.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">
                Google Reklamları
              </h2>

              <p>
                Sitemizde Google AdSense reklam hizmetleri kullanılabilir.
                Google, kullanıcıların ilgi alanlarına göre reklam göstermek
                amacıyla çerezlerden yararlanabilir.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">
                Çerezleri Kontrol Etme
              </h2>

              <p>
                Kullanıcılar tarayıcı ayarları üzerinden çerezleri silebilir,
                engelleyebilir veya sınırlandırabilir.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-semibold text-white">
                İletişim
              </h2>

              <p>
                Çerez politikası hakkında sorularınız için iletişim sayfamız
                üzerinden bizimle iletişime geçebilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}