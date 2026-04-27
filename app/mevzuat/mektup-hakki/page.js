const kaynaklar = [
  "5275 Sayılı Kanun",
  "Ceza İnfaz Kurumları Yönetmeliği",
  "Anayasa Madde 22",
  "AİHS Madde 8",
  "AYM İçtihatları",
];

const sorunlar = [
  "Mektupların verilmemesi",
  "Geciktirilerek teslim edilmesi",
  "Keyfi sansür uygulanması",
  "Gazete ve dergi engeli",
  "Avukat yazışmalarına müdahale",
  "Aileyle haberleşmenin kısıtlanması",
];

export const metadata = {
  title: "Cezaevinde Mektup ve Haberleşme Hakkı | Cezaevi Hakları",
  description:
    "Tutuklu ve hükümlülerin mektup, posta ve haberleşme hakkı hakkında mevzuat ve başvuru yolları.",
};

export default function MektupHakkiPage() {
  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-[#101827] to-[#070b14]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-5 inline-flex rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-4 py-2 text-sm font-semibold text-[#c9a96e]">
            Haklara Göre Mevzuat
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            Mektup ve Haberleşme Hakkı
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Mahpusların aileleri, yakınları ve avukatlarıyla yazılı iletişim
            kurabilmesi temel haberleşme özgürlüğünün bir parçasıdır.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="text-2xl font-bold text-[#c9a96e]">Dayanak Mevzuat</h2>

            <div className="mt-6 space-y-3">
              {kaynaklar.map((item) => (
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
            <h2 className="text-2xl font-bold text-[#c9a96e]">Sık Görülen Sorunlar</h2>

            <div className="mt-6 space-y-3">
              {sorunlar.map((item) => (
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
          <h2 className="text-2xl font-bold text-[#c9a96e]">Başvuru Yolu</h2>

          <p className="mt-4 text-sm leading-7 text-slate-200">
            Haberleşme hakkının hukuka aykırı şekilde sınırlandığı düşünülüyorsa
            kurum idaresine başvuru, infaz hâkimliği şikâyeti ve gerekli
            hâllerde bireysel başvuru yolları değerlendirilebilir.
          </p>
        </div>
      </section>
    </main>
  );
}