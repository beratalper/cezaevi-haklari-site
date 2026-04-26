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

        <article className="relative mx-auto max-w-4xl">
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
      </section>
    </main>
  );
}