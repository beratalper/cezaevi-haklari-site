import posts from "../posts";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = posts.find((x) => x.slug === slug);

  if (!post) {
    return {
      title: "Makale Bulunamadı",
    };
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
  };
}

export default async function MakaleDetay({ params }) {
  const { slug } = await params;
  const post = posts.find((x) => x.slug === slug);

  if (!post) {
    return (
      <main className="min-h-screen bg-[#070b14] px-6 py-20 text-white">
        <section className="mx-auto max-w-5xl">
          <h1 className="font-serif text-5xl font-semibold">
            Makale bulunamadı
          </h1>
        </section>
      </main>
    );
  }

  return (
  <main className="min-h-screen bg-[#070b14] text-white">
    <section className="relative overflow-hidden px-6 py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_320px]">
        
        <article className="max-w-4xl">
          <a
            href="/makaleler"
            className="mb-10 inline-block text-sm text-slate-400 hover:text-[#d9bd83]"
          >
            ← Makalelere dön
          </a>

          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
            Cezaevi Hakları Rehberi
          </p>

          <h1 className="font-serif text-4xl font-semibold leading-tight md:text-6xl">
            {post.title}
          </h1>

          <p className="mt-6 text-xl leading-9 text-slate-300">
            {post.excerpt}
          </p>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <p className="text-lg leading-9 text-slate-300">
              {post.content}
            </p>
          </div>
        </article>

        <aside className="space-y-6">
          
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">
              Hızlı Arama
            </div>

            <form action="/kararlar" className="mt-5 space-y-3">
              <input
                type="text"
                name="q"
                placeholder="Karar ara..."
                className="w-full rounded-2xl bg-white px-4 py-3 text-slate-900 outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-[#c9a96e] px-4 py-3 font-semibold text-[#08111f]"
              >
                Ara
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">
              Popüler Konular
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <a href="/konular/telefon-hakki" className="block hover:text-[#d9bd83]">Telefon Hakkı</a>
              <a href="/konular/gorus-hakki" className="block hover:text-[#d9bd83]">Görüş Hakkı</a>
              <a href="/konular/saglik-hakki" className="block hover:text-[#d9bd83]">Sağlık Hakkı</a>
              <a href="/konular/disiplin-cezalari" className="block hover:text-[#d9bd83]">Disiplin Cezaları</a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">
              Güven
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <div>✓ AYM karar odaklı içerikler</div>
              <div>✓ Güncel mevzuat rehberi</div>
              <div>✓ Sade ve anlaşılır anlatım</div>
            </div>
          </div>

        </aside>

      </div>
    </section>
  </main>
);
}