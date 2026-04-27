import data from "../../data/kararlar.json";

const config = {
  "telefon-hakki": {
    title: "Telefon Hakkı Kararları",
    desc: "Cezaevinde telefon hakkı ile ilgili AYM kararları.",
    keys: ["telefon"],
  },

  "saglik-hakki": {
    title: "Sağlık Hakkı Kararları",
    desc: "Sağlık, tedavi, hastane sevki ve ilaç erişimi kararları.",
    keys: ["sağlık", "tedavi", "hastane", "ilaç"],
  },

  "disiplin": {
    title: "Disiplin Cezası Kararları",
    desc: "Disiplin cezaları ve savunma hakkı kararları.",
    keys: ["disiplin"],
  },

  "gorus-hakki": {
    title: "Görüş Hakkı Kararları",
    desc: "Açık görüş, kapalı görüş ve ziyaret hakkı kararları.",
    keys: ["görüş", "ziyaret"],
  },

  "mektup-hakki": {
    title: "Mektup ve Haberleşme Kararları",
    desc: "Mektup, posta ve haberleşme hakkı kararları.",
    keys: ["mektup", "haberleşme"],
  },

  "nakil": {
    title: "Nakil Kararları",
    desc: "Cezaevi nakil ve sevk kararları.",
    keys: ["nakil", "sevk"],
  },

  "kotu-muamele": {
    title: "Kötü Muamele Kararları",
    desc: "İşkence, darp ve kötü muamele kararları.",
    keys: ["kötü muamele", "işkence", "darp"],
  },
};

export default async function Page({ params }) {
  const { slug } = await params;

  const cfg = config[slug];

  if (!cfg) {
    return (
      <main className="min-h-screen bg-[#070b14] text-white p-20">
        Sayfa bulunamadı.
      </main>
    );
  }

  const filtered = data.filter((item) => {
    const konu = (item.konu || "").toLowerCase();
    return cfg.keys.some((k) => konu.includes(k));
  });

  return (
    <main className="min-h-screen bg-[#070b14] text-white px-6 py-20">
      <section className="mx-auto max-w-6xl">
        <a href="/kararlar" className="text-sm text-slate-400">
          ← Kararlara dön
        </a>

        <h1 className="mt-6 text-6xl font-serif">{cfg.title}</h1>

        <p className="mt-5 max-w-3xl text-slate-300 text-lg">
          {cfg.desc}
        </p>

        <div className="mt-8 text-3xl text-[#d9bd83] font-semibold">
          {filtered.length} karar bulundu
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {filtered.map((x, i) => (
            <a
              key={i}
              href={`/kararlar/${x.basvuru_no.replace("/", "-")}`}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 hover:border-[#c9a96e]/50"
            >
              <div className="text-white text-xl font-semibold">
                {x.baslik}
              </div>

              <div className="mt-3 text-sm text-slate-400">
                {x.basvuru_no}
              </div>

              <div className="mt-4 text-sm text-[#d9bd83]">
                Kararı incele →
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}