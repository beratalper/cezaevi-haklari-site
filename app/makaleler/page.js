export default function Makaleler() {
  const posts = [
    {
      title: "Cezaevlerinde Kötü Muamele Yasağı",
      text: "Tutuklu ve hükümlülerin fiziksel ve psikolojik bütünlüğü devlet güvencesi altındadır. İşkence, eziyet ve insan haysiyetiyle bağdaşmayan muamele yasaktır.",
    },
    {
      title: "Cezaevinde Sağlık Hakkı",
      text: "Mahpusların muayene, tedavi, ilaç ve hastaneye sevk süreçlerine erişimi temel hak kapsamındadır.",
    },
    {
      title: "Tutuklu ve Hükümlülerin Haberleşme Hakkı",
      text: "Mektup, telefon görüşmesi ve belirli şartlarda elektronik iletişim hakları mevzuatla korunmaktadır.",
    },
    {
      title: "Ziyaret Hakkı ve Aile İlişkileri",
      text: "Yakınlarla görüşme hakkı, aile hayatına saygı hakkı kapsamında önem taşır.",
    },
    {
      title: "Disiplin Cezalarına Karşı Başvuru Yolları",
      text: "Hücre cezası, ziyaret yasağı ve benzeri işlemlere karşı idari ve yargısal başvuru yolları bulunmaktadır.",
    },
    {
      title: "AYM’ye Bireysel Başvuru Şartları",
      text: "Olağan kanun yollarının tüketilmesi ve süresinde başvuru yapılması gerekir.",
    },
  ];

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
        Bilgilendirici İçerikler
      </p>

      <h1 className="mb-6 text-5xl font-semibold tracking-tight">
        Makaleler
      </h1>

      <p className="max-w-3xl text-lg leading-8 text-gray-600">
        Ceza infaz kurumları, mahpus hakları ve bireysel başvuru süreçleri hakkında
        sade ve anlaşılır rehber içerikler.
      </p>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <article
            key={post.title}
            className="rounded-3xl border border-[#e5e1d8] bg-white p-8 hover:bg-[#f8f5ee]"
          >
            <h2 className="mb-4 text-2xl font-semibold leading-tight">
              {post.title}
            </h2>

            <p className="leading-8 text-gray-600">{post.text}</p>

            <div className="mt-6 text-sm font-semibold text-gray-500">
              Yakında detaylı içerik →
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}