export default function KonularPage() {
  const haklar = [
    ["Telefon Hakkı", "/konular/telefon-hakki"],
    ["Görüş Hakkı", "/konular/gorus-hakki"],
    ["Mektup ve Haberleşme", "/konular/mektup-hakki"],
    ["Sağlık Hakkı", "/konular/saglik-hakki"],
    ["Disiplin Cezaları", "/konular/disiplin-cezalari"],
    ["Nakil Talebi", "/konular/nakil-hakki"],
    ["Açık Cezaevi", "/konular/acik-cezaevi"],
    ["İnfaz Hâkimliği", "/konular/infaz-hakimligi"],
  ];

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
            Cezaevi Hakları
          </p>

          <h1 className="font-serif text-5xl font-semibold tracking-tight md:text-7xl">
            Haklar
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Ceza infaz kurumlarında tutuklu ve hükümlülerin en çok karşılaştığı
            hak başlıklarını inceleyin.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {haklar.map(([title, href]) => (
              <a
                key={title}
                href={href}
                className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:-translate-y-1 hover:border-[#c9a96e]/50 hover:bg-white/[0.07]"
              >
                <div className="mb-6 h-1 w-12 rounded-full bg-[#c9a96e]" />
                <h2 className="font-serif text-2xl font-semibold group-hover:text-[#d9bd83]">
                  {title}
                </h2>
                <div className="mt-6 text-sm font-semibold text-[#d9bd83]">
                  İncele →
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}