import Link from "next/link";
import data from "./data/kararlar.json";

function parseDate(dateStr) {
  if (!dateStr) return new Date(0);

  const [day, month, year] = dateStr.split("/");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export default function Home() {
  const cards = [
    ["Haberleşme Hakkı", "Mektup, telefon ve haberleşme hakkına ilişkin kararlar.", "/haklar"],
    ["Aile Hayatı ve Ziyaret Hakkı", "Aile hayatı, açık görüş ve ziyaret hakkı kararları.", "/haklar"],
    ["İfade Özgürlüğü, Yayın ve Bilgiye Erişim", "Kitap, gazete, süreli yayın ve bilgiye erişim kararları.", "/haklar"],
    ["Sağlık Hakkı", "Tedavi, hastane sevki ve sağlık hakkı kararları.", "/haklar"],
    ["Cezaevi Koşulları", "Barınma, hijyen ve fiziksel koşullara ilişkin kararlar.", "/haklar"],
    ["Kötü Muamele ve Güç Kullanımı", "Güç kullanımı, arama ve kötü muamele iddiaları.", "/haklar"],
    ["Disiplin Cezaları ve İnfaz Uygulamaları", "Disiplin cezaları ve infaz rejimi kararları.", "/haklar"],
    ["Nakil ve Sevk İşlemleri", "Cezaevi nakli ve sevk koşullarına ilişkin kararlar.", "/haklar"],
  ];

  const guncelKararlar = data
    .filter((item) => item.karar_tarihi && item.baslik)
    .sort((a, b) => parseDate(b.karar_tarihi) - parseDate(a.karar_tarihi))
    .filter((item) => item.ustKategori && item.altKategori)
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="relative overflow-hidden border-b border-white/10 px-6 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%),radial-gradient(circle_at_bottom_left,#1e3a8a33,transparent_40%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div>
            <h1 className="text-5xl font-semibold leading-tight md:text-7xl">
              Cezaevi hak ihlallerine ilişkin{" "}
              <span className="text-[#d9bd83]">AYM karar arşivi</span>
            </h1>

            <p className="mt-10 max-w-2xl text-lg leading-8 text-slate-300">
              Ceza infaz kurumlarına ilişkin bireysel başvuru kararlarını konu,
              sonuç, başvuru numarası ve hak kategorisine göre inceleyin.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                ["1000+", "Bireysel Başvuru Kararı"],
                ["10", "Ana Kategori"],
                ["21", "Alt Başlık"],
                ["%100", "Mobil Uyum"],
              ].map(([num, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <div className="text-3xl font-semibold text-[#d9bd83]">
                    {num}
                  </div>
                  <div className="mt-2 text-sm text-slate-400">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 p-5 text-sm leading-7 text-slate-300">
              Güncel içtihat veri tabanı ile cezaevlerinde yaşanan hak
              ihlallerine ilişkin kararlar sade, hızlı ve anlaşılır konu
              başlıklarıyla sunulur.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-10">
          <h2 className="text-4xl font-semibold">Güncel Kararlar</h2>
        </div>

        <div className="space-y-5">
          {guncelKararlar.map((item) => (
            <Link
              key={item.basvuru_no}
              href={`/kararlar/${item.basvuru_no.replace("/", "-")}`}
              className="group flex flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-amber-300/50 hover:bg-white/[0.06] md:flex-row md:items-center"
            >
              <div className="flex-1">
                <div className="mb-4 flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-amber-300/15 px-3 py-1 font-semibold text-amber-300">
                    Karar Tarihi: {item.karar_tarihi}
                  </span>

                  <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 font-semibold text-amber-300">
                    {item.ustKategori || "Cezaevi Hakları"}
                  </span>

                  <span className="rounded-full border border-white/10 px-3 py-1 text-white/60">
                    {item.altKategori || "İlgili Karar"}
                  </span>
                </div>

                <h3 className="text-2xl font-bold leading-snug text-white group-hover:text-amber-300">
                  {item.baslik}
                </h3>

                <p className="mt-3 text-sm text-white/55">
                  Başvuru No: {item.basvuru_no}
                </p>

                <p className="mt-4 max-w-4xl text-sm leading-7 text-white/60 line-clamp-2">
                  {item.konu}
                </p>
              </div>

              <div className="shrink-0 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-bold text-black transition group-hover:scale-105 group-hover:bg-[#e2c17c]">
                Kararı İncele
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-12">
          <h2 className="text-4xl font-semibold">
            Öne Çıkan Konu Başlıkları
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(([title, text, href]) => (
            <Link
              key={title}
              href={href}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-[#c9a96e]/50 hover:bg-white/[0.06]"
            >
              <div className="mb-5 h-1 w-12 rounded-full bg-[#c9a96e]" />

              <h3 className="text-xl font-semibold group-hover:text-[#d9bd83]">
                {title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h3 className="text-3xl font-semibold">
            AYM Kararlarını Daha Erişilebilir Hale Getiriyoruz
          </h3>

          <p className="mx-auto mt-6 max-w-3xl leading-8 text-slate-400">
            Cezaevlerinde yaşanan hak ihlalleriyle ilgili AYM kararlarına
            ilişkin bilgilendirici içerikler.
          </p>
        </div>
      </section>
    </main>
  );
}