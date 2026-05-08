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
    ust_kategori,
    MAX(basvuru_konusu) AS basvuru_konusu,
    COUNT(*) AS toplam,
    COUNT(*) FILTER (
      WHERE sonuc ILIKE '%İhlal%'
        AND sonuc NOT ILIKE '%İhlal Olmadığı%'
    ) AS ihlal
  FROM kararlar
  WHERE cezaevi_mi = true
    AND ust_kategori IS NOT NULL
    GROUP BY ust_kategori
  ORDER BY ust_kategori, toplam DESC;
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
    const ust = row.ust_kategori;
    console.log(row.ust_kategori);
    if (!grouped[ust]) {
      grouped[ust] = {
        title: ust,
        slug: slugify(ust),
        description: "",
        konular: [],
        toplam: 0,
        ihlal: 0,
        items: [],
      };
    }

    const toplam = Number(row.toplam || 0);
    const ihlal = Number(row.ihlal || 0);

    grouped[ust].toplam += toplam;
    grouped[ust].ihlal += ihlal;

    if (row.basvuru_konusu) {
      grouped[ust].konular.push(row.basvuru_konusu);
    }

  }

  const customDescriptions = {
    "Telefon, mektup ve haberleşme":
      "Telefon görüşleri, mektup hakkı ve iletişim kısıtlamalarına ilişkin Anayasa Mahkemesi bireysel başvuru kararları.",

    "Kötü muamele / işkence":
      "Fiziksel müdahale, kötü muamele iddiaları ve güç kullanımına ilişkin bireysel başvuru kararları.",

    "Ziyaret ve aile hayatı":
      "Açık görüş, kapalı görüş ve aile ziyaretlerine ilişkin hak ihlali kararları.",

    "Disiplin cezaları":
      "Cezaevlerinde uygulanan disiplin cezaları ve infaz uygulamalarına ilişkin Anayasa Mahkemesi kararları.",

    "Yayın, kitap, ifade özgürlüğü":
      "Kitap, gazete, yayın erişimi ve ifade özgürlüğüne ilişkin cezaevi kararları.",

    "Avukat görüşü ve savunma":
      "Avukatla görüşme hakkı, savunma hakkı ve müdafi erişimine ilişkin bireysel başvuru kararları.",

    "Sağlık ve tedavi":
      "Hastane sevkleri, tedavi süreçleri ve sağlık hizmetine erişime ilişkin Anayasa Mahkemesi kararları.",

    "Tahliye, infaz hesabı, koşullu salıverilme":
      "Tahliye süreçleri, infaz hesaplamaları ve koşullu salıverilmeye ilişkin bireysel başvuru kararları.",

    "Yaşam hakkı / ölüm / intihar":
      "Cezaevlerinde yaşam hakkı, ölüm olayları ve intihar iddialarına ilişkin Anayasa Mahkemesi kararları.",

    "Arama, mahremiyet ve özel hayat":
      "Üst aramaları, mahremiyet hakkı ve özel hayatın korunmasına ilişkin bireysel başvuru kararları.",

    "Nakil, sevk, infaz koşulları":
      "Cezaevi nakilleri, sevk işlemleri ve infaz koşullarına ilişkin hak ihlali kararları.",
  };

  for (const group of Object.values(grouped)) {
    const text = group.konular.join(" ").toLowerCase();

    if (customDescriptions[group.title]) {
      group.description = customDescriptions[group.title];
      continue;
    }

    if (text.includes("telefon")) {
      group.description =
        "Telefon görüşleri, iletişim kısıtlamaları ve haberleşme hakkına ilişkin bireysel başvuru kararları.";
    } else if (text.includes("hastane") || text.includes("tedavi")) {
      group.description =
        "Sağlık hizmetine erişim, hastane sevkleri ve tedavi süreçlerine ilişkin Anayasa Mahkemesi kararları.";
    } else if (text.includes("ziyaret") || text.includes("görüş")) {
      group.description =
        "Açık görüş, kapalı görüş ve aile ziyaretlerine ilişkin hak ihlali kararları.";
    } else if (text.includes("kötü muamele")) {
      group.description =
        "Kötü muamele iddiaları, güç kullanımı ve insan onuruna aykırı uygulamalara ilişkin kararlar.";
    } else {
      group.description =
        "Cezaevlerinde yaşanan hak ihlallerine ilişkin Anayasa Mahkemesi bireysel başvuru kararları.";
    }
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