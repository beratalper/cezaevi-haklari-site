import sqlite3
import json
from pathlib import Path

DB_PATH = Path(r"C:\Projects\aym_kararlar_v2\db\aym_kararlar.db")
OUT_PATH = Path(r"C:\Projects\cezaevi-haklari-site\app\data\tum-kararlar.json")

OUT_PATH.parent.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("""
SELECT
    basvuru_no,
    karar_adi AS baslik,
    karar_tarihi,
    COALESCE(sonuc_aym, sonuc, '') AS sonuc,
    hak_ozgurluk_aym,
    mudahale_iddiasi_aym,
    basvuru_konusu AS konu,
    url AS link
FROM kararlar
ORDER BY id DESC
""")

rows = []
for r in cur.fetchall():
    rows.append({
        "basvuru_no": r["basvuru_no"] or "",
        "baslik": r["baslik"] or "",
        "karar_tarihi": r["karar_tarihi"] or "",
        "sonuc": r["sonuc"] or "",
        "hak_ozgurluk_aym": r["hak_ozgurluk_aym"] or "",
        "mudahale_iddiasi_aym": r["mudahale_iddiasi_aym"] or "",
        "konu": r["konu"] or "",
        "link": r["link"] or "",
    })

conn.close()

with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(rows, f, ensure_ascii=False, indent=2)

print(f"Tamamlandı: {OUT_PATH}")
print(f"Toplam karar: {len(rows)}")