export const metadata = {
  title: "Gizlilik Politikası | Cezaevi Hakları",
  description: "Cezaevi Hakları gizlilik politikası.",
};

export default function GizlilikPage() {
  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-5xl font-semibold">Gizlilik Politikası</h1>

        <div className="mt-8 space-y-5 text-sm leading-7 text-slate-300">
          <p>
            Cezaevi Hakları olarak ziyaretçilerimizin gizliliğine önem veriyoruz.
            Bu sayfa, sitede hangi bilgilerin işlenebileceği ve bu bilgilerin
            hangi amaçlarla kullanılabileceği hakkında genel bilgilendirme sunar.
          </p>

          <p>
            Sitemizi ziyaret ettiğinizde, tarayıcı türü, ziyaret zamanı, IP
            adresi, görüntülenen sayfalar ve benzeri teknik veriler analiz,
            güvenlik ve hizmet kalitesinin artırılması amacıyla işlenebilir.
          </p>

          <p>
            Sitemizde Google AdSense gibi üçüncü taraf reklam hizmetleri
            kullanılabilir. Bu hizmetler, çerezler aracılığıyla ilgi alanlarınıza
            uygun reklamlar gösterebilir.
          </p>

          <p>
            Kullanıcılar tarayıcı ayarları üzerinden çerezleri devre dışı
            bırakabilir veya silebilir. Ancak bazı site özellikleri bu durumda
            beklenen şekilde çalışmayabilir.
          </p>

          <p>
            Sitede yer alan dış bağlantılardan veya üçüncü taraf hizmetlerin
            gizlilik uygulamalarından Cezaevi Hakları sorumlu değildir.
          </p>

          <p>
            Bu politika zaman zaman güncellenebilir. Güncel metin her zaman bu
            sayfada yayımlanır.
          </p>
        </div>
      </div>
    </main>
  );
}