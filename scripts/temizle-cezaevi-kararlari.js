const fs = require("fs");
const path = require("path");

const INPUT = path.join(process.cwd(), "app", "data", "tum-kararlar.json");

const OUT_FINAL = path.join(process.cwd(), "app", "data", "kararlar.json");
const OUT_DAR = path.join(process.cwd(), "app", "data", "dar-cezaevi-kararlari.json");
const OUT_GENIS = path.join(process.cwd(), "app", "data", "genis-cezaevi-kararlari.json");
const OUT_MUHTEMEL = path.join(process.cwd(), "app", "data", "muhtemel-cezaevi-kararlari.json");
const OUT_DISI = path.join(process.cwd(), "app", "data", "cezaevi-disi-kararlar.json");

function normalize(text = "") {
  return String(text).toLocaleLowerCase("tr-TR").replace(/\s+/g, " ").trim();
}

function uniqueByBasvuruNo(list) {
  const map = new Map();
  for (const item of list) {
    if (item.basvuru_no && !map.has(item.basvuru_no)) {
      map.set(item.basvuru_no, item);
    }
  }
  return [...map.values()];
}

function konuText(item) {
  return normalize(item.konu || "");
}

function metaText(item) {
  return normalize(
    [
      item.baslik,
      item.hak_ozgurluk_aym,
      item.mudahale_iddiasi_aym,
      item.sonuc,
      item.sonuc_aym,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

const disiKelimeler = [
  "subay sözleşmesinin yenilenmemesi",
  "astsubay sözleşmesi",
  "devlet memurluğundan çıkarılma",
  "işveren tarafından incelenmesi",
  "kurumsal e-posta",
  "jandarma okullar komutanlığı",
  "yurt dışında alınan lisans",
  "denklik tanınması",
  "üniversitenin lisans programına",
  "yükseköğretim öğrencisi",
  "yabancı dil sınavı",
  "sosyal güvenlik kurumu",
  "ilaç bedeli",
  "hastaya reçete edilen ilaç",
  "tıbbi ihmal sonucu zarara uğranılması",
  "tıbbi ihmal sonucu meydana",
  "tıbbi ihmal sonucu gerçekleştiği",
  "sağlık görevlileri hakkında",
];

const darKonuKelimeleri = [
  "ceza infaz kurumunda",
  "ceza infaz kurumundaki",
  "ceza infaz kurumuna",
  "ceza infaz kurumundan",
  "ceza infaz kurumlarında",
  "ceza infaz kurumları",
  "cezaevi",
  "infaz kurumunda",
  "infaz kurumundaki",
  "infaz kurumuna",
  "infaz kurumundan",
  "koğuş",
  "koğuşta",
  "açık görüş",
  "kapalı görüş",
  "infaz koruma memuru",
  "infaz koruma memurları",
  "ceza infaz kurumu idaresi",
  "ceza infaz kurumu görevlileri",
  "nakil aracı",
  "çıplak arama",
];

const ekDarKonuKelimeleri = [
  "hükümlü olarak bulunduğu ceza infaz kurumu",
  "hükümlü bulunduğu ceza infaz kurumu",
  "hükümlü olan başvurucuya gönderilen",
  "hükümlü olan başvurucunun gazeteye erişiminin engellenmesi",
  "hükümlü olan başvurucunun haber ve fikirlere erişiminin engellenmesi",
  "tutuklu olan başvurucuya teslim edilmeyerek",
  "tutuklu olduğu sırada başvurucuya",
  "hükmen tutuklu olduğu sırada",
  "ceza infaz kurumu tarafından",
  "ceza infaz kurumu eğitim kurulu",
  "infaz hâkimliği",
  "infaz hakimliği",
  "kantininde satılan radyo",
  "gazetenin bazı sayfalarının çıkartılarak",
  "derginin bazı sayfalarının çıkartılarak",
  "derginin yasaklanması",
  "gazetenin teslim edilmemesi",
  "derginin teslim edilmemesi",
  "kitap taslağının",
  "ajandaların ceza infaz kurumunca alıkonulması",
  "anayasa mahkemesine gönderilmek üzere idareye verilen dilekçenin",
  "cenaze törenine katılması için izin verilmemesi",
  "taziyesini kabul etmesi için izin verilmemesi",
];

const genisInfazKelimeleri = [
  "müddetname",
  "muddetname",
  "koşullu salıverme",
  "kosullu saliverme",
  "denetimli serbestlik",
  "bihakkın tahliye",
  "tahliye tarih",
  "infaz erteleme",
  "hapis cezasının infaz",
  "cezanın infaz",
  "mahsup talebi",
  "fazladan infaz edilen ceza",
  "gözaltında kalınan sürenin hükmedilen ceza süresinden mahsup",
  "gözaltında geçirilen sürenin hükmedilen cezadan mahsup",
];

const metaCezaeviKelimeleri = [
  "ceza infaz kurumu uygulamaları",
  "ceza infaz kurumunda ifade",
  "ceza infaz kurumunda kitap",
  "ceza infaz kurumunda süreli yayın",
  "ceza infaz kurumunda eğitim",
  "haberleşme-ceza infaz kurumu",
  "infaz kurumunda güç kullanımı",
  "infaz kurumunun fiziki koşulları",
  "nakil aracının fiziki koşulları",
  "ceza infaz kurumunda açlık grevi",
];

function disiMi(item) {
  const konu = konuText(item);

  if (disiKelimeler.some((k) => konu.includes(k))) return true;

  if (
    konu.includes("tıbbi ihmal") &&
    !konu.includes("ceza infaz") &&
    !konu.includes("cezaevi") &&
    !konu.includes("infaz kurum") &&
    !konu.includes("mahpus") &&
    !konu.includes("hükümlü") &&
    !konu.includes("tutuklu")
  ) {
    return true;
  }

  if (
    (konu.includes("eğitim") || konu.includes("denklik")) &&
    !konu.includes("ceza infaz") &&
    !konu.includes("cezaevi") &&
    !konu.includes("infaz kurum") &&
    !konu.includes("mahpus") &&
    !konu.includes("hükümlü") &&
    !konu.includes("tutuklu")
  ) {
    return true;
  }

  return false;
}

function darMi(item) {
  const konu = konuText(item);

  return (
    darKonuKelimeleri.some((k) => konu.includes(k)) ||
    ekDarKonuKelimeleri.some((k) => konu.includes(k))
  );
}

function genisMi(item) {
  const konu = konuText(item);
  return genisInfazKelimeleri.some((k) => konu.includes(k));
}

function metaMuhtemelMi(item) {
  const meta = metaText(item);
  return metaCezaeviKelimeleri.some((k) => meta.includes(k));
}

function siniflandir(item) {
  if (disiMi(item)) return "disi";
  if (darMi(item)) return "dar";
  if (genisMi(item)) return "genis";
  if (metaMuhtemelMi(item)) return "muhtemel";
  return "disi";
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error("Dosya bulunamadı:", INPUT);
    process.exit(1);
  }

  const all = uniqueByBasvuruNo(JSON.parse(fs.readFileSync(INPUT, "utf8")));

  const dar = [];
  const genis = [];
  const muhtemel = [];
  const disi = [];

  for (const item of all) {
    const kategori = siniflandir(item);

    if (kategori === "dar") dar.push(item);
    else if (kategori === "genis") genis.push(item);
    else if (kategori === "muhtemel") muhtemel.push(item);
    else disi.push(item);
  }

  writeJson(OUT_FINAL, dar);
  writeJson(OUT_DAR, dar);
  writeJson(OUT_GENIS, genis);
  writeJson(OUT_MUHTEMEL, muhtemel);
  writeJson(OUT_DISI, disi);

  console.log("Bakım tamamlandı.");
  console.log("----------------");
  console.log("Toplam karar:", all.length);
  console.log("Dar cezaevi hakları:", dar.length);
  console.log("Geniş infaz/tutukluluk kararları:", genis.length);
  console.log("Muhtemel / kontrol edilecek kararlar:", muhtemel.length);
  console.log("Cezaevi dışı kararlar:", disi.length);

  console.log("\nÖrnek dar cezaevi kararları:");
  dar.slice(0, 25).forEach((x) => {
    console.log(`- ${x.basvuru_no} | ${x.baslik}`);
  });

  console.log("\nÖrnek muhtemel kararlar:");
  muhtemel.slice(0, 25).forEach((x) => {
    console.log(`- ${x.basvuru_no} | ${x.baslik}`);
  });
}

main();