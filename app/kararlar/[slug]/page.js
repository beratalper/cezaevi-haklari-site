import data from "../../data/kararlar.json";

export default async function KararDetay({ params }) {
  const { slug } = await params;
  const no = slug.replace("-", "/");

  const item = data.find((x) => x.basvuru_no === no);

  if (!item) {
    return (
      <main className="min-h-screen bg-[#070b14] px-6 py-20 text-white">
        <section className="mx-auto max-w-6xl">
          <h1 className="font-serif text-5xl font-semibold">
            Karar bulunamadı
          </h1>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />

        <div className="relative mx-auto max-w-5xl">
          <a
            href="/kararlar"
            className="mb-10 inline-block text-sm text-slate-400 hover:text-[#d9bd83]"
          >
            ← Kararlara dön
          </a>

          <h1 className="font-serif text-4xl font-semibold leading-tight md:text-6xl">
            {item.baslik}
          </h1>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              Başvuru No: {item.basvuru_no}
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              Karar Tarihi: {item.karar_tarihi}
            </div>

            <div className="rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-4 py-2 text-[#d9bd83]">
              Sonuç: {item.sonuc}
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">
              Başvuru Konusu
            </div>

            <p className="text-lg leading-9 text-slate-300">
              {item.konu}
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">
              Hızlı Değerlendirme
            </div>

            <p className="leading-8 text-slate-300">
              Bu karar, ceza infaz kurumları bağlamında bireysel başvuru
              denetimine ilişkin bir AYM karar özetidir. Detaylı inceleme için
              karar konusu ve sonucu birlikte değerlendirilmelidir.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}