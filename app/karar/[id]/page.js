import data from "../../data.json";

export default async function Page({ params }) {
  const { id } = await params;

  const karar = data.find((x) => String(x.id) === String(id));

  if (!karar) {
    return (
      <main className="min-h-screen bg-[#070b14] text-white p-10">
        Karar bulunamadı.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-sm text-cyan-400 mb-3">{karar.kategori}</div>

        <h1 className="text-4xl font-bold leading-tight mb-6">
          {karar.karar_adi}
        </h1>

        <div className="text-gray-400 mb-10">
          {karar.basvuru_no} • {karar.karar_tarihi}
        </div>

        {karar.basvuru_konusu && (
          <section className="mb-10 rounded-3xl border border-[#c9a96e]/30 bg-[#c9a96e]/10 p-7">
            <h2 className="mb-3 text-xl font-semibold text-[#e7c98d]">
              Başvuru Konusu
            </h2>
            <p className="leading-8 text-slate-200">
              {karar.basvuru_konusu}
            </p>
          </section>
        )}

        <article className="rounded-3xl border border-white/10 bg-white/5 p-8 whitespace-pre-line leading-8 text-gray-200">
          {karar.metin}
        </article>
      </div>
    </main>
  );
}