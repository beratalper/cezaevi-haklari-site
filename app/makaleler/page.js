import posts from "./posts";
export default function Makaleler() {
  
  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-[#c9a96e]">
            Bilgilendirici İçerikler
          </p>

          <h1 className="font-serif text-5xl font-semibold tracking-tight md:text-7xl">
            Makaleler
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Ceza infaz kurumları, mahpus hakları ve bireysel başvuru süreçleri
            hakkında sade, anlaşılır ve güncel rehber içerikler.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <a
                key={post.title}
                href={`/makaleler/${post.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#c9a96e]/50 hover:bg-white/[0.07]"
              >
                <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />

                <div className="relative">
                  <div className="mb-6 h-1 w-12 rounded-full bg-[#c9a96e]" />

                  <h2 className="font-serif text-3xl font-semibold leading-tight text-white group-hover:text-[#d9bd83]">
                    {post.title}
                  </h2>

                  <p className="mt-5 leading-8 text-slate-300">
                    {post.text}
                  </p>

                  <div className="mt-8 text-sm font-semibold text-[#d9bd83]">
                    Makaleyi oku →
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-16 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <div className="font-serif text-3xl font-semibold text-[#d9bd83]">
              Yeni içerikler hazırlanıyor
            </div>

            <p className="mt-4 text-slate-400">
              Telefon hakkı, açık görüş, disiplin cezaları, sağlık sevki ve
              bireysel başvuru süreci hakkında yeni rehberler eklenecektir.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}