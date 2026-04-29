const fs = require("fs");
const path = require("path");

const INPUT = path.join(
  process.cwd(),
  "app",
  "data",
  "muhtemel-cezaevi-kararlari.json"
);

function normalize(text = "") {
  return String(text).replace(/\s+/g, " ").trim();
}

function main() {
  const data = JSON.parse(fs.readFileSync(INPUT, "utf8"));

  console.log("Muhtemel karar sayısı:", data.length);
  console.log("----------------------");

  data.slice(0, 80).forEach((item, index) => {
    console.log(`\n${index + 1}. ${item.basvuru_no} | ${item.baslik}`);
    console.log(`Tarih: ${item.karar_tarihi || "-"}`);
    console.log(`Konu: ${normalize(item.konu || "-")}`);
    console.log(`Müdahale: ${normalize(item.mudahale_iddiasi_aym || "-")}`);
    console.log(`Sonuç: ${normalize(item.sonuc || "-")}`);
  });
}

main();