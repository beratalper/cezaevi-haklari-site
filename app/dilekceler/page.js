export default function Dilekceler() {
  const petitions = [
    {
      title: "Kötü Muamele İddiasına İlişkin Başvuru Taslağı",
      desc: "Darp, kötü koşullar, çıplak arama veya insan onuruna aykırı muamele iddialarında genel örnek taslak.",
    },
    {
      title: "Sağlık Hakkı İhlali Başvuru Taslağı",
      desc: "Muayene, ilaç, sevk veya tedaviye erişememe durumlarında kullanılabilecek genel örnek.",
    },
    {
      title: "Disiplin Cezasına İtiraz Taslağı",
      desc: "Hücre cezası, görüş yasağı veya diğer disiplin işlemlerine karşı genel başvuru örneği.",
    },
    {
      title: "Telefon / Görüş / Mektup Hakkı Taslağı",
      desc: "Haberleşme ve aile ile temas hakkına ilişkin genel başvuru örneği.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
            Örnek Taslaklar
          </p>

          <h1 className="font-serif text-5xl font-semibold tracking-tight md:text-7xl">
            Dilekçeler
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Cezaevi hak ihlalleri, infaz hâkimliği başvuruları ve bireysel
            başvuru süreçleri için hazırlanmış genel bilgilendirme amaçlı örnek
            taslaklar.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {petitions.map((item) => (
              <article
                key={item.title}
                className="group rounded-3xl border border-white/10 bg-white/[0.04] p-8 transition hover:-translate-y-1 hover:border-[#c9a96e]/50 hover:bg-white/[0.07]"
              >
                <div className="mb-6 h-1 w-12 rounded-full bg-[#c9a96e]" />

                <h2 className="font-serif text-3xl font-semibold group-hover:text-[#d9bd83]">
                  {item.title}
                </h2>

                <p className="mt-5 leading-8 text-slate-300">
                  {item.desc}
                </p>

                <div className="mt-8 text-sm font-semibold text-[#d9bd83]">
                  Yakında detaylı içerik →
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <div className="font-serif text-3xl font-semibold text-[#d9bd83]">
              Önemli Uyarı
            </div>

            <p className="mt-4 text-slate-400">
              Bu içerikler yalnızca genel bilgilendirme amaçlıdır. Somut olayda
              profesyonel hukuki destek alınmalıdır.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}