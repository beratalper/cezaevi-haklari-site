export default function Dilekceler() {
  const petitions = [
    "Kötü muamele iddiasına ilişkin başvuru taslağı",
    "Sağlık hizmetine erişememe iddiasına ilişkin başvuru taslağı",
    "Disiplin cezasına ilişkin başvuru taslağı",
    "Haberleşme ve ziyaret hakkına ilişkin başvuru taslağı",
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
        Örnek Taslaklar
      </p>

      <h1 className="mb-6 text-5xl font-semibold tracking-tight">
        Dilekçe Örnekleri
      </h1>

      <p className="max-w-3xl text-lg leading-8 text-gray-600">
        Cezaevleriyle ilgili bireysel başvuru süreçleri için genel bilgilendirme
        amaçlı örnek dilekçe taslakları.
      </p>

      <div className="mt-14 space-y-5">
        {petitions.map((title) => (
          <article
            key={title}
            className="rounded-3xl border border-[#e5e1d8] bg-white p-8"
          >
            <h2 className="text-2xl font-semibold">{title}</h2>

            <p className="mt-4 leading-8 text-gray-600">
              Yakında eklenecek. Bu içerik yalnızca genel bilgilendirme amacı
              taşır; somut olayda hukuki danışmanlık alınmalıdır.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}