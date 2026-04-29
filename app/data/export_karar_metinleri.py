import sqlite3
import json
import re
from pathlib import Path

DB_PATH = Path(r"C:\Projects\aym_kararlar_v2\db\aym_kararlar.db")
OUT_DIR = Path(r"C:\Projects\cezaevi-haklari-site\public\karar-metinleri")

OUT_DIR.mkdir(parents=True, exist_ok=True)

def slugify_basvuru_no(no):
    no = str(no or "").strip()
    no = no.replace("/", "-")
    no = re.sub(r"[^0-9\-]", "", no)
    return no

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("""
SELECT
    basvuru_no,
    karar_adi,
    karar_tarihi,
    COALESCE(sonuc_aym, sonuc, '') AS sonuc,
    hak_ozgurluk_aym,
    mudahale_iddiasi_aym,
    basvuru_konusu,
    url,
    metin
FROM kararlar
WHERE basvuru_no IS NOT NULL
""")

count = 0

for r in cur.fetchall():
    slug = slugify_basvuru_no(r["basvuru_no"])
    if not slug:
        continue

    item = {
        "basvuru_no": r["basvuru_no"] or "",
        "baslik": r["karar_adi"] or "",
        "karar_tarihi": r["karar_tarihi"] or "",
        "sonuc": r["sonuc"] or "",
        "hak_ozgurluk_aym": r["hak_ozgurluk_aym"] or "",
        "mudahale_iddiasi_aym": r["mudahale_iddiasi_aym"] or "",
        "konu": r["basvuru_konusu"] or "",
        "link": r["url"] or "",
        "metin": r["metin"] or "",
    }

    out_file = OUT_DIR / f"{slug}.json"

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(item, f, ensure_ascii=False)

    count += 1

conn.close()

print(f"Tamamlandı. Oluşturulan karar metni dosyası: {count}")
print(f"Klasör: {OUT_DIR}")