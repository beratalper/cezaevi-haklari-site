import data from "../../data/kararlar.json";

export default async function KararDetay({ params }) {
  const { slug } = await params;
  const no = slug.replace("-", "/");

  const item = data.find((x) => x.basvuru_no === no);

  if (!item) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-4xl font-semibold">Karar bulunamadı</h1>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <a
        href="/kararlar"
        className="mb-8 inline-block text-sm text-gray-500 hover:underline"
      >
        ← Kararlara dön
      </a>

      <h1 className="text-5xl font-semibold tracking-tight">
        {item.baslik}
      </h1>

      <div className="mt-5 text-sm text-gray-500">
        Başvuru No: {item.basvuru_no} · Karar Tarihi: {item.karar_tarihi}
      </div>

      <div className="mt-6 inline-block rounded-full bg-[#f3efe6] px-4 py-2 text-sm font-semibold">
        Karar Sonucu: {item.sonuc}
      </div>

      <div className="mt-10 rounded-3xl border border-[#e5e1d8] bg-white p-8">
        <h2 className="mb-4 text-2xl font-semibold">Başvuru Konusu</h2>

        <p className="leading-8 text-gray-700">
          {item.konu}
        </p>
      </div>
    </section>
  );
}