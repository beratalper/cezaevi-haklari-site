import sqlite3
import json
from pathlib import Path

DB_PATH = Path(r"C:\Projects\aym_kararlar_v2\db\aym_kararlar.db")
OUT_PATH = Path(r"C:\Projects\cezaevi-haklari-site\app\data\tum-kararlar.json")

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("""
SELECT
  basvuru_no,
  karar_tarihi,
  karar_adi AS baslik,
  basvuru_konusu AS konu,
  sonuc_aym AS sonuc,
  hak_ozgurluk_aym,
  mudahale_iddiasi_aym,
  sonuc_aym,
  url
FROM kararlar
WHERE basvuru_no IS NOT NULL
  AND TRIM(basvuru_no) <> ''
  AND (
    mudahale_iddiasi_aym LIKE '%ceza infaz kurumu%'
    OR mudahale_iddiasi_aym LIKE '%Ceza infaz kurumu%'
    OR mudahale_iddiasi_aym LIKE '%infaz kurumunda%'
    OR mudahale_iddiasi_aym LIKE '%İnfaz kurumunda%'
    OR mudahale_iddiasi_aym LIKE '%Haberleşme-Sakıncalı mektup%'
    OR mudahale_iddiasi_aym LIKE '%Tıbbi ihmal%'
    OR mudahale_iddiasi_aym LIKE '%sağlık hizmetlerine erişememe%'
    OR mudahale_iddiasi_aym LIKE '%Çıplak%'
    OR mudahale_iddiasi_aym LIKE '%detaylı arama%'
    OR mudahale_iddiasi_aym LIKE '%İnfaz, koşullu salıverme%'
    OR mudahale_iddiasi_aym LIKE '%Mahkumiyet (infaz)%'
    OR mudahale_iddiasi_aym LIKE '%Nakil aracının fiziki koşulları%'
    OR mudahale_iddiasi_aym LIKE '%Eğitim%'
  )
ORDER BY id ASC
""")

rows = [dict(row) for row in cur.fetchall()]

Path(OUT_PATH).parent.mkdir(parents=True, exist_ok=True)

with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)

conn.close()

print(f"Export tamamlandı. Kayıt sayısı: {len(rows)}")
print(OUT_PATH)