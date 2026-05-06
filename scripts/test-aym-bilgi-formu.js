import "dotenv/config";
import axios from "axios";
import * as cheerio from "cheerio";

const basvuruNo = "2022/74582";

function clean(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

async function main() {
  const url = `https://kararlarbilgibankasi.anayasa.gov.tr/BB/${basvuruNo}`;

  const { data: html } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  const $ = cheerio.load(html);
  const body = clean($("body").text());

  for (const keyword of [
    "Müdahale İddiası",
    "Mahkemeye erişim",
    "İhlal",
    "Yeniden yargılama",
  ]) {
    const index = body.indexOf(keyword);
    console.log(`\n--- ${keyword} @ ${index} ---`);
    console.log(body.slice(Math.max(0, index - 1000), index + 2000));
  }

  console.log("\n--- TABLES ---");
  $("table").each((i, table) => {
    const tableText = clean($(table).text());

    if (
      tableText.includes("Mahkemeye erişim") ||
      tableText.includes("Müdahale İddiası") ||
      tableText.includes("Yeniden yargılama")
    ) {
      console.log("\nTABLE INDEX:", i);
      console.log(tableText.slice(0, 3000));

      console.log("\nROWS:");
      $(table)
        .find("tr")
        .each((ri, tr) => {
          const cells = [];
          $(tr)
            .find("th,td")
            .each((ci, cell) => {
              cells.push(clean($(cell).text()));
            });

          if (cells.length) {
            console.log(ri, cells);
          }
        });
    }
  });
}

main().catch(console.error);