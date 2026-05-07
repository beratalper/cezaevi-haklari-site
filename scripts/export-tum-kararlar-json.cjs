require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const OUT_PATH = path.join(
  process.cwd(),
  "app",
  "data",
  "tum-kararlar.json"
);

async function main() {
  const { data, error } = await supabase
    .from("karar_kategorileri")
    .select(`
  karar_id,
  basvuru_no,
  karar_adi,
  karar_tarihi,
  ust_kategori,
  alt_kategori,
  sonuc_aym,
  konu
`)
    .not("ust_kategori", "is", null)
    .not("alt_kategori", "is", null)
    .order("karar_tarihi", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const rows = data.map((r) => ({
    basvuru_no: r.basvuru_no || "",
    baslik: r.karar_adi || "",
    karar_tarihi: r.karar_tarihi || "",
    sonuc: r.sonuc_aym || "",
    ustKategori: r.ust_kategori || "",
    altKategori: r.alt_kategori || "",
    mudahale_iddiasi_aym: r.alt_kategori || "",
    basvuru_konusu: r.konu || "",
  }));

  fs.writeFileSync(
    OUT_PATH,
    JSON.stringify(rows, null, 2),
    "utf8"
  );

  console.log("Tamamlandı:");
  console.log(OUT_PATH);
  console.log("Toplam kayıt:", rows.length);
}

main();