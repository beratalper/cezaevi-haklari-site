const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const BASE =
  "https://kararlarbilgibankasi.anayasa.gov.tr";

const START_URL =
  "https://kararlarbilgibankasi.anayasa.gov.tr/Ara?KelimeAra%5B%5D=ceza+infaz+kurumunda";

const bulunanlar = new Set();

async function scrapePage(url) {

  console.log("Taranıyor:", url);

  const response = await axios.get(url, {
    timeout: 30000,
    headers: {
      "User-Agent":
        "Mozilla/5.0",
    },
  });

  const html = response.data;

  const $ = cheerio.load(html);

  $("a").each((_, el) => {

    const href =
      $(el).attr("href");

    if (!href) return;

    const match =
      href.match(/\/BB\/(\d+\/\d+)/);

    if (match) {

      bulunanlar.add(
        match[1]
      );
    }
  });

  console.log(
    "Toplam:",
    bulunanlar.size
  );

  let nextLink = null;

  $("a").each((_, el) => {

    const text =
      $(el).text().trim();

    const href =
      $(el).attr("href");

    if (
      text === "»"
    ) {

      nextLink =
        href.startsWith("http")
          ? href
          : href.replace(
            "http://",
            "https://"
          );
    }
  });

  return nextLink;
}

async function run() {

  let current = START_URL;

  let counter = 0;

  while (current) {

    counter++;

    console.log(
      "Sayfa:",
      counter
    );

    try {

      current =
        await scrapePage(current);

      fs.writeFileSync(
        "basvurular.json",
        JSON.stringify(
          [...bulunanlar],
          null,
          2
        )
      );

      await new Promise((r) =>
        setTimeout(r, 1500)
      );

    } catch (err) {

      console.log(
        "HATA:",
        err.message
      );

      break;
    }
  }

  console.log("Bitti.");
  console.log(
    "Toplam başvuru:",
    bulunanlar.size
  );
}

run();