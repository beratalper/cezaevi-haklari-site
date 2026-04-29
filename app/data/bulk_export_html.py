from pathlib import Path
import sqlite3
import time
import subprocess
import sys
import re

BASE_DIR = Path(__file__).resolve().parents[2]
DB_PATH = Path(r"C:\Projects\aym_kararlar_v2\db\aym_kararlar.db")
PILOT_SCRIPT = Path(__file__).with_name("export_html_pilot.py")
OUT_DIR = BASE_DIR / "public" / "karar-html"

LIMIT = 250
SLEEP_EVERY = 25
SLEEP_SECONDS = 3


def slugify_basvuru_no(no):
    return no.replace("/", "-")


def get_basvuru_nolari():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
        SELECT basvuru_no
        FROM kararlar
        WHERE basvuru_no IS NOT NULL
        ORDER BY id
        LIMIT ?
    """, (LIMIT,))

    rows = [r[0] for r in cur.fetchall()]
    conn.close()
    return rows


def set_pilot_basvuru_no(no):
    text = PILOT_SCRIPT.read_text(encoding="utf-8")

    text = re.sub(
        r'BASVURU_NO\s*=\s*["\'].*?["\']',
        f'BASVURU_NO = "{no}"',
        text,
        count=1,
    )

    PILOT_SCRIPT.write_text(text, encoding="utf-8")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    basvuru_nolari = get_basvuru_nolari()

    print(f"Toplam denenecek karar: {len(basvuru_nolari)}")

    success = 0
    skipped = 0
    failed = 0

    for idx, no in enumerate(basvuru_nolari, start=1):
        slug = slugify_basvuru_no(no)
        out_file = OUT_DIR / f"{slug}.html"

        print("\n" + "=" * 60)
        print(f"{idx}/{len(basvuru_nolari)} işleniyor: {no}")

        if out_file.exists():
            print(f"Zaten var, geçiliyor: {out_file.name}")
            skipped += 1
            continue

        try:
            set_pilot_basvuru_no(no)

            result = subprocess.run(
                [sys.executable, str(PILOT_SCRIPT)],
                text=True,
                encoding="utf-8",
                errors="replace",
            )

            if result.returncode == 0 and out_file.exists():
                print(f"TAMAM: {no}")
                success += 1
            else:
                print(f"HATA: {no}")
                failed += 1

        except Exception as e:
            print(f"HATA: {no} -> {e}")
            failed += 1

        if idx % SLEEP_EVERY == 0:
            print(f"{SLEEP_SECONDS} saniye bekleniyor...")
            time.sleep(SLEEP_SECONDS)

    print("\n" + "=" * 60)
    print("BİTTİ")
    print(f"Başarılı: {success}")
    print(f"Zaten vardı: {skipped}")
    print(f"Hatalı: {failed}")


if __name__ == "__main__":
    main()