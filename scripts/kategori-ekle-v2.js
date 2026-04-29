const fs = require("fs");
const path = require("path");

const kararlarPath = path.join(process.cwd(), "app", "data", "kararlar.json");
const kararlar = JSON.parse(fs.readFileSync(kararlarPath, "utf8"));

function normalize(text = "") {
  return text
    .toString()
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/\s+/g, " ")
    .trim();
}

const kurallar = [
  {
    ustKategori: "Haberleşme Hakkı",
    altKategori: "Haberleşme (ceza infaz kurumu genel)",
    kelimeler: ["haberleşme", "haberlesme", "telefon", "görüşme", "gorusme"],
  },
  {
    ustKategori: "Haberleşme Hakkı",
    altKategori: "Haberleşme (ceza infaz kurumunda sakıncalı mektup)",
    kelimeler: ["mektup", "sakıncalı mektup", "sakincali mektup", "yazışma", "yazisma"],
  },
  {
    ustKategori: "Aile Hayatı ve Ziyaret Hakkı",
    altKategori: "Aile hayatı (ceza infaz kurumu)",
    kelimeler: ["aile hayatı", "aile hayati", "ziyaret", "görüş", "gorus", "açık görüş", "acik gorus", "kapalı görüş", "kapali gorus"],
  },
  {
    ustKategori: "İfade Özgürlüğü, Yayın ve Bilgiye Erişim",
    altKategori: "Ceza infaz kurumunda ifade",
    kelimeler: ["ifade", "dilekçe", "dilekce", "şikayet", "sikayet", "başvuru hakkı", "basvuru hakki"],
  },
  {
    ustKategori: "İfade Özgürlüğü, Yayın ve Bilgiye Erişim",
    altKategori: "Ceza infaz kurumunda süreli yayın",
    kelimeler: ["süreli yayın", "sureli yayin", "gazete", "dergi", "yayın", "yayin"],
  },
  {
    ustKategori: "İfade Özgürlüğü, Yayın ve Bilgiye Erişim",
    altKategori: "Ceza infaz kurumunda kitap",
    kelimeler: ["kitap", "yayın yasağı", "yayin yasagi"],
  },
  {
    ustKategori: "Sağlık Hakkı",
    altKategori: "Tıbbi ihmal",
    kelimeler: ["sağlık", "saglik", "tedavi", "hastane", "doktor", "revir", "ilaç", "ilac", "ameliyat", "muayene", "tıbbi", "tibbi"],
  },
  {
    ustKategori: "Sağlık Hakkı",
    altKategori: "Tutulanın sağlık durumunun tutulmayla uyumsuzluğu",
    kelimeler: ["tutulmayla uyumsuz", "cezaevinde kalamaz", "infaz erteleme", "hastalık", "hastalik", "engelli"],
  },
  {
    ustKategori: "Cezaevi Koşulları",
    altKategori: "İnfaz Kurumunun fiziki koşulları",
    kelimeler: ["fiziki koşul", "fiziki kosul", "koğuş", "kogus", "hijyen", "temizlik", "kalabalık", "kalabalik", "havalandırma", "havalandirma"],
  },
  {
    ustKategori: "Cezaevi Koşulları",
    altKategori: "Tutma koşulları nedeniyle kötü muamele (ceza infaz kurumu)",
    kelimeler: ["tutma koşulları", "tutma kosullari", "barınma", "barinma", "yaşam alanı", "yasam alani"],
  },
  {
    ustKategori: "Cezaevi Koşulları",
    altKategori: "Tutma koşulları nedeniyle kötü muamele (tek kişilik oda)",
    kelimeler: ["tek kişilik oda", "tek kisilik oda", "hücre", "hucre", "tecrit"],
  },
  {
    ustKategori: "Kötü Muamele ve Güç Kullanımı",
    altKategori: "İnfaz kurumunda güç kullanımı",
    kelimeler: ["güç kullanımı", "guc kullanimi", "darp", "zor kullanma", "fiziksel müdahale", "fiziksel mudahale"],
  },
  {
    ustKategori: "Kötü Muamele ve Güç Kullanımı",
    altKategori: "Çıplak/detaylı arama",
    kelimeler: ["çıplak arama", "ciplak arama", "detaylı arama", "detayli arama"],
  },
  {
    ustKategori: "Disiplin Cezaları ve İnfaz Uygulamaları",
    altKategori: "Mahkumiyet (infaz)",
    kelimeler: ["mahkumiyet", "mahkûmiyet", "infaz"],
  },
  {
    ustKategori: "Disiplin Cezaları ve İnfaz Uygulamaları",
    altKategori: "İnfaz, koşullu salıverme",
    kelimeler: ["koşullu salıverme", "kosullu saliverme", "şartlı tahliye", "sartli tahliye", "denetimli serbestlik"],
  },
  {
    ustKategori: "Eğitim Hakkı",
    altKategori: "Ceza infaz kurumunda eğitim",
    kelimeler: ["eğitim", "egitim", "sınav", "sinav", "okul", "ders", "öğrenim", "ogrenim"],
  },
  {
    ustKategori: "Nakil ve Sevk İşlemleri",
    altKategori: "Nakil aracının fiziki koşulları",
    kelimeler: ["nakil", "sevk", "ring aracı", "ring araci", "nakil aracı", "nakil araci"],
  },
  {
    ustKategori: "Açlık Grevi",
    altKategori: "Ceza infaz kurumunda açlık grevi",
    kelimeler: ["açlık grevi", "aclik grevi", "ölüm orucu", "olum orucu"],
  },
];

function kategoriBul(karar) {
  const metin = normalize(
    [
      karar.ustKategori,
      karar.altKategori,
      karar.mudahale_iddiasi_aym,
      karar.hak_ozgurluk_aym,
      karar.konu,
      karar.baslik,
      karar.sonuc_aym,
    ]
      .filter(Boolean)
      .join(" ")
  );

  for (const kural of kurallar) {
    if (kural.kelimeler.some((kelime) => metin.includes(normalize(kelime)))) {
      return {
        ustKategori: kural.ustKategori,
        altKategori: kural.altKategori,
      };
    }
  }

  return {
    ustKategori: "",
    altKategori: "",
  };
}

const yeniKararlar = kararlar.map((karar) => {
  const kategori = kategoriBul(karar);

  return {
    ...karar,
    ustKategori: kategori.ustKategori,
    altKategori: kategori.altKategori,
  };
});

fs.writeFileSync(kararlarPath, JSON.stringify(yeniKararlar, null, 2), "utf8");

const eslesen = yeniKararlar.filter((x) => x.ustKategori).length;
const eslesmeyen = yeniKararlar.filter((x) => !x.ustKategori).length;

console.log("Kategori ekleme v2 tamamlandı.");
console.log("Toplam karar:", yeniKararlar.length);
console.log("Eşleşen karar:", eslesen);
console.log("Eşleşmeyen karar:", eslesmeyen);

console.log("\nEşleşmeyen ilk 20 karar:");
console.log(
  yeniKararlar
    .filter((x) => !x.ustKategori)
    .slice(0, 20)
    .map((x) => ({
      basvuru_no: x.basvuru_no,
      baslik: x.baslik,
      mudahale_iddiasi_aym: x.mudahale_iddiasi_aym,
      konu: x.konu,
    }))
);