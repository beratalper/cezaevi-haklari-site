import Link from "next/link";
import { hakAciklamalari } from "@/data/hakAciklamalari";
import { Pool } from "pg";
import HakAccordion from "@/components/HakAccordion";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function HaklarPage() {
  const result = await pool.query(`
  SELECT
    h.kategori,
    h.alt_kategori,
    h.slug,
    h.baslik,
    h.aciklama,
    COUNT(k.id)::int AS karar_sayisi,
    COUNT(k.id) FILTER (
      WHERE k.sonuc ILIKE '%İhlal%'
        AND k.sonuc NOT ILIKE '%İhlal Olmadığı%'
    )::int AS ihlal_sayisi
  FROM ictihat_kategori_haritasi h
  LEFT JOIN kararlar k
    ON k.ictihat_slug = h.slug
   AND k.cezaevi_mi = true
  GROUP BY
    h.kategori,
    h.alt_kategori,
    h.slug,
    h.baslik,
    h.aciklama
  ORDER BY
    h.kategori,
    h.alt_kategori;
`);

  function slugify(value = "") {
    return value
      .toLowerCase()
      .replaceAll("ğ", "g")
      .replaceAll("ü", "u")
      .replaceAll("ş", "s")
      .replaceAll("ı", "i")
      .replaceAll("ö", "o")
      .replaceAll("ç", "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const grouped = {};

  for (const row of result.rows) {
    const kategori = row.kategori || "Diğer cezaevi hakları";

    if (!grouped[kategori]) {
      grouped[kategori] = {
        title: kategori,
        toplam: 0,
        ihlal: 0,
        items: [],
      };
    }

    grouped[kategori].toplam += Number(row.karar_sayisi || 0);
    grouped[kategori].ihlal += Number(row.ihlal_sayisi || 0);

    grouped[kategori].items.push({
      title: row.baslik || row.alt_kategori,
      alt_kategori: row.alt_kategori,
      slug: row.slug,
      description: row.aciklama,
      karar_sayisi: Number(row.karar_sayisi || 0),
      ihlal_sayisi: Number(row.ihlal_sayisi || 0),
    });
  }

  const hakGruplari = Object.values(grouped)
    .map((group) => ({
      ...group,
      oran: group.toplam
        ? ((group.ihlal / group.toplam) * 100).toFixed(1)
        : "0.0",
    }))
    .sort((a, b) => b.toplam - a.toplam);

  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-20 text-white">
      <section className="mx-auto max-w-6xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
          Cezaevi Hakları
        </p>

        <h1 className="max-w-5xl text-4xl font-bold leading-tight md:text-5xl">
          Cezaevlerinde Yaşanan Hak İhlalleri & Anayasa Mahkemesi Tarafından
          Verilen Bireysel Başvuru Kararları
        </h1>

        <p className="mt-8 max-w-4xl text-lg leading-8 text-white/65">
          Ceza infaz kurumlarında bulunan tutuklu ve hükümlüler de Anayasa ve
          hukuk devleti ilkesiyle güvence altına alınan temel haklara sahiptir.
          Bu sayfada, cezaevlerinde yaşanmış ve yaşanabilecek olan hak
          ihlallerini daha anlaşılır konu başlıkları altında inceleyebilir;
          Anayasa Mahkemesine bireysel başvuru yolunda hangi konuların öne
          çıktığını AYM kararları ışığında görebilirsiniz.
        </p>

        <div className="mt-16 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-3xl font-bold text-amber-300">
            Cezaevlerinde En Sık Karşılaşılan Hak İhlalleri
          </h2>

          <div className="mt-8 space-y-6 text-[17px] leading-8 text-white/75">
            <p>
              Cezaevlerinde bulunan tutuklu ve hükümlüler; haberleşme hakkı,
              sağlık hakkı, kötü muamele yasağı, açık görüş hakkı, kapalı görüş hakkı
              ve avukatla görüşme hakkı gibi temel haklardan yararlanmaya devam eder.
            </p>

            <p>
              Anayasa Mahkemesi bireysel başvuru kararlarında özellikle sağlık hizmetine erişim,
              disiplin cezaları, haberleşmenin engellenmesi, aile görüşlerinin kısıtlanması
              ve kötü muamele iddiaları sıkça değerlendirilmektedir.
            </p>

            <p>
              Aşağıda yer alan konu başlıkları altında cezaevlerinde yaşanan hak ihlallerine ilişkin
              Anayasa Mahkemesi kararlarını inceleyebilir, benzer olaylarda hangi anayasal hakların
              ihlal edildiğini görebilirsiniz.
            </p>
          </div>
        </div>
        <HakAccordion hakGruplari={hakGruplari} />
      </section>
    </main>
  );
}