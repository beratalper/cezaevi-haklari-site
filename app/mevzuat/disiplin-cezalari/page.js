const kaynaklar = [
  "5275 Sayılı Kanun",
  "Ceza İnfaz Kurumları Yönetmeliği",
  "Anayasa Madde 38",
  "Adil Yargılanma İlkeleri",
  "AYM İçtihatları",
];

const sorunlar = [
  "Savunma alınmadan ceza verilmesi",
  "Ölçüsüz disiplin cezası",
  "Hücre cezasının keyfi uygulanması",
  "Delilsiz tutanakla ceza verilmesi",
  "Telefon/görüş yasağının aşırı uygulanması",
  "Karara itiraz yolunun engellenmesi",
];

export const metadata = {
  title: "Cezaevinde Disiplin Cezaları | Cezaevi Hakları",
  description:
    "Cezaevinde disiplin cezaları, hücre cezası, savunma hakkı ve itiraz yolları.",
};

export default function DisiplinCezalariPage() {
  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-[#101827] to-[#070b14]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-5 inline-flex rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-4 py-2 text-sm font-semibold text-[#c9a96e]">
            Haklara Göre Mevzuat
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            Disiplin Cezaları
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Cezaevlerinde disiplin işlemleri kanuna uygun, ölçülü ve savunma
            hakkına saygılı şekilde yürütülmelidir.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="text-2xl font-bold text-[#c9a96e]">Dayanak Mevzuat</h2>

            <div className="mt-6 space-y-3">
              {kaynaklar.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0d1320] p-8">
            <h2 className="text-2xl font-bold text-[#c9a96e]">Sık Görülen Sorunlar</h2>

            <div className="mt-6 space-y-3">
              {sorunlar.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-slate-200">
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
            Disiplin cezasına karşı süresi içinde infaz hâkimliğine şikâyet ve
            gerekli diğer kanun yolları değerlendirilebilir.
          </p>
        </div>
      </section>
    </main>
  );
}