export default function Istatistikler() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
        Veri Analizi
      </p>

      <h1 className="mb-6 text-5xl font-semibold tracking-tight">
        İstatistikler
      </h1>

      <p className="max-w-3xl text-lg leading-8 text-gray-600">
        Cezaevleriyle ilgili AYM bireysel başvuru kararlarına ilişkin istatistikler
        veri seti tamamlandıkça güncellenecektir.
      </p>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-[#e5e1d8] bg-white p-8">
          <div className="text-sm text-gray-500">Toplam karar</div>
          <div className="mt-3 text-3xl font-semibold">Hazırlanıyor</div>
        </div>

        <div className="rounded-3xl border border-[#e5e1d8] bg-white p-8">
          <div className="text-sm text-gray-500">İhlal kararı</div>
          <div className="mt-3 text-3xl font-semibold">Hazırlanıyor</div>
        </div>

        <div className="rounded-3xl border border-[#e5e1d8] bg-white p-8">
          <div className="text-sm text-gray-500">Kabul edilemezlik</div>
          <div className="mt-3 text-3xl font-semibold">Hazırlanıyor</div>
        </div>
      </div>

      <div className="mt-10 rounded-3xl border border-[#e5e1d8] bg-white p-8">
        <h2 className="mb-4 text-2xl font-semibold">Kapsam</h2>
        <p className="leading-8 text-gray-600">
          Bu bölümde kötü muamele yasağı, sağlık hizmetlerine erişim, disiplin
          cezaları, haberleşme ve ziyaret hakkı gibi konulara ilişkin kararlar
          sınıflandırılarak gösterilecektir.
        </p>
      </div>
    </section>
  );
}