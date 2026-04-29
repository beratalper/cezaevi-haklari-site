import subprocess
import sys
from pathlib import Path

SCRIPT = Path(__file__).with_name("export_html_pilot.py")

TEST_LIST = [
    "2012/1000",
    "2013/409",
    "2014/12151",
    "2018/30030",
    "2019/2148",
    "2020/34532",
    "2021/58970",
]

for no in TEST_LIST:
    print("\n" + "=" * 60)
    print(f"Çalıştırılıyor: {no}")
    print("=" * 60)

    text = SCRIPT.read_text(encoding="utf-8")

    import re
    text = re.sub(
        r'BASVURU_NO\s*=\s*["\'].*?["\']',
        f'BASVURU_NO = "{no}"',
        text,
        count=1,
    )

    SCRIPT.write_text(text, encoding="utf-8")

    result = subprocess.run(
        [sys.executable, str(SCRIPT)],
        text=True,
        encoding="utf-8",
        errors="replace",
    )

    if result.returncode != 0:
        print(f"HATA: {no}")
    else:
        print(f"TAMAM: {no}")