import { mevzuatItems } from "./data";

const haklar = [
  { title: "Telefon Hakkı", href: "/mevzuat/telefon-hakki" },
  { title: "Görüş Hakkı", href: "/mevzuat/gorus-hakki" },
  { title: "Mektup ve Haberleşme", href: "/mevzuat/mektup-hakki" },
  { title: "Sağlık Hakkı", href: "/mevzuat/saglik-hakki" },
  { title: "Disiplin Cezaları", href: "/mevzuat/disiplin-cezalari" },
  { title: "Nakil Talebi", href: "/mevzuat/nakil-hakki" },
  { title: "Açık Cezaevi", href: "/mevzuat/acik-cezaevi" },
  { title: "İnfaz Hâkimliği Başvurusu", href: "/mevzuat/infaz-hakimligi" },
];

export const metadata = {
  title: "Cezaevi Mevzuatı | Cezaevi Hakları",
  description:
    "Cezaevi hakları, infaz hukuku, hükümlü ve tutuklu hakları, infaz hâkimliği başvuruları ve ilgili mevzuat.",
};

export default function MevzuatPage() {
  const kategoriler = {};

  mevzuatItems.forEach((item) => {

    if (!kategoriler[item.kategori]) {
      kategoriler[item.kategori] = [];
    }

    kategoriler[item.kategori].push(item);

  });

  Object.keys(kategoriler).forEach((kategori) => {

    kategoriler[kategori].sort((a, b) =>
      a.title.localeCompare(b.title, "tr")
    );

  });
  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-[#101827] to-[#070b14]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-5 inline-flex rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-4 py-2 text-sm font-semibold text-[#c9a96e]">
            Cezaevi Hakları Mevzuatı
          </div>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            Tutuklu ve hükümlü haklarına ilişkin temel mevzuat
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Bu sayfada ceza infaz kurumları, mahpus hakları, infaz hâkimliği
            başvuruları, ziyaret, telefon, sağlık, disiplin ve nakil süreçleriyle
            ilgili temel kanun ve yönetmeliklere ulaşabilirsiniz.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">

        <div className="space-y-6">

          {Object.entries(kategoriler).map(
            ([kategori, items]) => (

              <div key={kategori}>

                <h2 className="mb-3 text-xl font-bold text-[#f3d99b]">
                  {kategori}
                </h2>

                <div className="space-y-3">

                  {items.map((item) => (

                    <a
                      key={item.title}
                      href={item.href}
                      target={
                        item.href.startsWith("http")
                          ? "_blank"
                          : undefined
                      }
                      rel={
                        item.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#c9a96e]/40 hover:bg-white/[0.06]"
                    >

                      <h3 className="text-lg font-bold text-white">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {item.desc}
                      </p>

                    </a>

                  ))}

                </div>

              </div>
            )
          )}

        </div>

      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-[#0d1320] p-8">
          <h2 className="text-2xl font-bold">Haklara Göre Mevzuat</h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            Cezaevindeki hak ihlallerinde çoğu zaman birden fazla mevzuat
            birlikte değerlendirilir. Aşağıdaki başlıklar, kullanıcıların en çok
            aradığı konulara göre hazırlanmıştır.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {haklar.map((hak) => (
              <a
                key={typeof hak === "string" ? hak : hak.title}
                href={typeof hak === "string" ? "#" : hak.href}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-slate-200 transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
              >
                {typeof hak === "string" ? hak : hak.title}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}