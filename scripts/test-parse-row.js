import "dotenv/config";
import axios from "axios";
import * as cheerio from "cheerio";

const testBasvuruNolari = [
  "2022/74582",
  "2021/47391",
  "2021/29101",
  "2023/68722",
  "2023/97960",
];

function clean(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function parseIncelemeSonuclari(html) {
  const $ = cheerio.load(html);
  const sonuc = [];

  $("table").each((i, table) => {
    const rows = [];

    $(table)
      .find("tr")
      .each((ri, tr) => {
        const cells = [];

        $(tr)
          .find("th,td")
          .each((ci, cell) => {
            cells.push(clean($(cell).text()));
          });

        if (cells.length) rows.push(cells);
      });

    if (!rows.length) return;

    const header = rows[0].join(" | ").toLowerCase();

    const uygunMu =
      header.includes("hak") &&
      header.includes("müdahale") &&
      header.includes("sonuç");

    if (!uygunMu) return;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      sonuc.push({
        hak_ozgurluk_aym: row[0] || null,
        mudahale_iddiasi_aym: row[1] || null,
        sonuc_aym: row[2] || null,
        giderim_aym: row[3] || null,
      });
    }
  });

  return sonuc;
}

async function fetchKarar(basvuruNo) {
  const url = `https://kararlarbilgibankasi.anayasa.gov.tr/BB/${basvuruNo}`;

  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  return html;
}

async function main() {
  for (const basvuruNo of testBasvuruNolari) {
    console.log("\n==============================");
    console.log("BAŞVURU NO:", basvuruNo);

    const html = await fetchKarar(basvuruNo);
    const rows = parseIncelemeSonuclari(html);

    console.dir(rows, { depth: null });

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

main().catch(console.error);