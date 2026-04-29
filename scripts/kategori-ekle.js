const fs = require("fs");
const path = require("path");

const kararlarPath = path.join(process.cwd(), "app", "data", "kararlar.json");
const haklarPath = path.join(process.cwd(), "data", "cezaeviHaklari.js");

const kararlar = JSON.parse(fs.readFileSync(kararlarPath, "utf8"));

const { cezaeviHaklari } = require("../data/cezaeviHaklari.js");

function normalize(text = "") {
  return text
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

function kategoriBul(karar) {
  const metin = normalize(
    [
      karar.mudahale_iddiasi_aym,
      karar.hak_ozgurluk_aym,
      karar.konu,
      karar.baslik,
    ]
      .filter(Boolean)
      .join(" ")
  );

  for (const group of cezaeviHaklari) {
    for (const item of group.items) {
      const itemNorm = normalize(item);

      if (metin.includes(itemNorm)) {
        return {
          ustKategori: group.title,
          altKategori: item,
        };
      }
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

console.log("Kategori ekleme tamamlandı.");
console.log("Toplam karar:", yeniKararlar.length);
console.log("Eşleşen karar:", eslesen);
console.log("Eşleşmeyen karar:", eslesmeyen);