from pathlib import Path
import re
import sqlite3
import time
import os
import subprocess
import base64

from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client

env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print("ENV PATH:", env_path)
print("ENV TEST:", SUPABASE_URL)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

BASE_DIR = Path(__file__).resolve().parents[1]
BASE_URL = "https://siyasipartikararlar.anayasa.gov.tr"
SEARCH_API_URL = f"{BASE_URL}/api/core/public/search"
TXT_DIR = BASE_DIR / "clean_text"
DB_DIR = BASE_DIR / "db"
REPORT_DIR = BASE_DIR / "reports"

DB_PATH = DB_DIR / "aym_kararlar.db"

START_PAGE = 1
END_PAGE = 1
ESKI_SAYFA_LIMIT = 2

def karar_dbde_var_mi(basvuru_no):
    result = (
        supabase
        .table("kararlar")
        .select("id")
        .eq("basvuru_no", basvuru_no)
        .limit(1)
        .execute()
    )

    return len(result.data) > 0

def clean_spaces(text):
    return re.sub(r"\s+", " ", text or "").strip()


def karar_url_from_id(karar_id):
    raw = f"kbb:{karar_id}"
    encoded = base64.urlsafe_b64encode(raw.encode("utf-8")).decode("utf-8").rstrip("=")

    return (
        f"{BASE_URL}/kbb/pages/search/BireyselBasvuru"
        f"?id={encoded}&type=BireyselBasvuru"
    )

def html_to_text(html):
    soup = BeautifulSoup(html or "", "html.parser")
    text = soup.get_text("\n", strip=True)
    return clean_spaces(text)

def collect_links_from_page(page_no):
    print(f"Liste API okunuyor: page={page_no}")

    payload = {
    "kararTipi": "BireyselBasvuru",
    "page": page_no,
    "size": 20,
    "sort": "yayinTarihi",
    "order": "desc",
}

    r = requests.post(
        SEARCH_API_URL,
        json=payload,
        timeout=30,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    r.raise_for_status()

    data = r.json()
    kararlar = data.get("data", [])

    items = []

    for karar in kararlar:
        karar_id = karar.get("id")
        basvuru_no = karar.get("basvuruNo")

        if not karar_id or not basvuru_no:
            continue

        items.append({
            "id": karar_id,
            "basvuru_no": basvuru_no,
            "url": karar_url_from_id(karar_id),
        })

    print(f"Bu sayfada bulunan karar: {len(items)}")
    return items

def fetch_decision_detail(karar_id):
    payload = {
        "id": karar_id,
        "size": 1,
        "kararTipi": "BireyselBasvuru",
    }

    r = requests.post(
        SEARCH_API_URL,
        json=payload,
        timeout=30,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    r.raise_for_status()

    data = r.json()
    kararlar = data.get("data", [])

    if kararlar:
        return kararlar[0]

    return None

def safe_filename_from_basvuru_no(basvuru_no):
    return basvuru_no.replace("/", "_")


def extract_title(text):
    patterns = [
        r"KARAR\s+([A-ZÇĞİÖŞÜ0-9 .'\-()]+ BAŞVURUSU(?: \(\d+\))?)",
        r"([A-ZÇĞİÖŞÜ0-9 .'\-()]+ BAŞVURUSU(?: \(\d+\))?)",
    ]

    for pat in patterns:
        m = re.search(pat, text)
        if m:
            return clean_spaces(m.group(1))

    return ""


def extract_decision_date(text):
    m = re.search(r"Karar Tarihi:\s*([0-9]{1,2}/[0-9]{1,2}/[0-9]{4})", text)
    if m:
        return m.group(1)
    return ""


def infer_sonuc_from_text(text):
    upper = text.upper()

    if (
        "KABUL EDİLEMEZ" in upper
        or "KABULEDİLEMEZ" in upper
        or "KABUL EDİLEBİLEMEZ" in upper
    ):
        return "KABUL EDİLEMEZ"

    if (
        "İHLAL EDİLMEDİĞİNE" in upper
        or "İHLAL EDİLMEDİĞİNE" in upper
    ):
        return "İHLAL OLMADIĞI"

    if (
        "İHLAL EDİLDİĞİNE" in upper
        or "İHLAL EDİLDİGİNE" in upper
    ):
        return "İHLAL"

    if (
        "DÜŞMESİNE" in upper
        or "İŞLEMDEN KALDIRILMASINA" in upper
    ):
        return "DÜŞME"

    if "KARAR VERİLMESİNE YER OLMADIĞINA" in upper:
        return "KARAR VERİLMESİNE YER OLMADIĞI"

    if "REDDİNE" in upper:
        return "RET"

    return ""


def infer_hak_from_text(text):
    known_rights = [
        "adil yargılanma hakkı",
        "mülkiyet hakkı",
        "kişi hürriyeti ve güvenliği hakkı",
        "kişi özgürlüğü ve güvenliği hakkı",
        "ifade özgürlüğü",
        "kötü muamele yasağı",
        "yaşam hakkı",
        "özel hayata saygı hakkı",
        "özel hayatın ve aile hayatının korunması hakkı",
        "eğitim hakkı",
        "sendika hakkı",
        "toplantı ve gösteri yürüyüşü düzenleme hakkı",
        "din ve vicdan özgürlüğü",
        "etkili başvuru hakkı",
        "suç ve cezaların kanuniliği ilkesi",
    ]

    lower = text.lower()
    found = []

    for right in known_rights:
        if right in lower:
            found.append(right.upper())

    return ", ".join(dict.fromkeys(found))

def extract_basvuru_konusu_from_info_form(bilgi_formu_text):
    info = clean_spaces(bilgi_formu_text)

    start = "II. BAŞVURU KONUSU"
    end = "III. İNCELEME SONUÇLARI"

    s = info.find(start)
    if s == -1:
        return ""

    s = s + len(start)
    e = info.find(end, s)

    if e == -1:
        return clean_spaces(info[s:])

    return clean_spaces(info[s:e])

def infer_basvuru_konusu_from_text(text):
    patterns = [
        r"I\.\s*BAŞVURUNUN KONUSU\s*(.*?)(?:II\.\s*BAŞVURU SÜRECİ|II\.\s*OLAY VE OLGULAR)",
        r"I\.\s*BAŞVURUNUN ÖZETİ\s*(.*?)(?:II\.\s*DEĞERLENDİRME|II\.\s*BAŞVURU SÜRECİ)",
    ]

    for pat in patterns:
        m = re.search(pat, text, flags=re.DOTALL)
        if m:
            return clean_spaces(m.group(1))

    return ""


def quality_status(text):
    problems = []

    if len(text) < 800:
        problems.append("çok_kısa")

    if (
        "TÜRKİYE CUMHURİYETİ ANAYASA MAHKEMESİ" not in text
        and "REPUBLIC OF TURKEY CONSTITUTIONAL COURT" not in text
    ):
        problems.append("başlık_yok")

    if (
        "BAŞVURUNUN KONUSU" not in text
        and "BAŞVURUNUN ÖZETİ" not in text
        and "SUBJECT OF APPLICATION" not in text
        and "SUBJECT-MATTER OF THE APPLICATION" not in text
    ):
        problems.append("konu_bölümü_yok")

    bad_markers = [
        "KARAR KİMLİK BİLGİLERİ Başvuru No",
        "Hak/Özgürlük",
        "T.C. Anayasa Mahkemesi Norm Denetimi",
        "ADRES Ahlatlıbel",
        "İLETİŞİM BİLGİLERİ",
    ]

    for marker in bad_markers:
        if marker in text:
            problems.append(f"kirli_marker:{marker}")

    if problems:
        return "; ".join(problems)

    return "OK"


def init_db():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS kararlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        basvuru_no TEXT UNIQUE,
        url TEXT,
        karar_adi TEXT,
        karar_tarihi TEXT,
        sonuc TEXT,
        hak TEXT,
        basvuru_konusu TEXT,
        metin TEXT,
        metin_uzunlugu INTEGER,
        kalite TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS loglar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT,
        basvuru_no TEXT,
        durum TEXT,
        detay TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)

    con.commit()
    con.close()


def already_exists(basvuru_no):
    return karar_dbde_var_mi(basvuru_no)


def save_decision(url, basvuru_no, text, bilgi_formu_text, karar_konusu_html=""):
    sonuc = infer_sonuc_from_text(text)
    hak = infer_hak_from_text(text)

    basvuru_konusu = html_to_text(karar_konusu_html)

    if basvuru_konusu == "":
        basvuru_konusu = extract_basvuru_konusu_from_info_form(bilgi_formu_text)

    if basvuru_konusu == "":
        basvuru_konusu = infer_basvuru_konusu_from_text(text)

    data = {
        "basvuru_no": basvuru_no,
        "karar_adi": extract_title(text),
        "karar_tarihi": extract_decision_date(text),
        "bilgi_formu_karar_tarihi": extract_decision_date(bilgi_formu_text),
        "sonuc": sonuc,
        "mudahale_iddiasi_aym": hak,
        "basvuru_konusu": basvuru_konusu,
        "metin": text,
    }

    supabase.table("kararlar").upsert(
        data,
        on_conflict="basvuru_no"
    ).execute()


def save_log(url, basvuru_no, durum, detay=""):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    cur.execute("""
    INSERT INTO loglar (url, basvuru_no, durum, detay)
    VALUES (?, ?, ?, ?)
    """, (
        url,
        basvuru_no,
        durum,
        clean_spaces(detay)[:1000],
    ))

    con.commit()
    con.close()


def main():
    init_db()

    TXT_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)

    all_links = []
    eski_sayfa_ust_uste = 0

    for page_no in range(START_PAGE, END_PAGE + 1):
        items = collect_links_from_page(page_no)

        print(f"\nSayfa {page_no} kontrol ediliyor...")
        print("Bu sayfadaki karar sayısı:", len(items))

        yeni_items = []

        for item in items:
            basvuru_no = item["basvuru_no"]
            
            if karar_dbde_var_mi(basvuru_no):
                print("Zaten var:", basvuru_no)
            else:
                print("Yeni karar:", basvuru_no)
                yeni_items.append(item)

        if yeni_items:
            eski_sayfa_ust_uste = 0
            all_links.extend(yeni_items)
        else:
            eski_sayfa_ust_uste += 1
            print("Bu sayfadaki tüm kararlar zaten DB'de var.")

        if eski_sayfa_ust_uste >= ESKI_SAYFA_LIMIT:
            print(f"\n{ESKI_SAYFA_LIMIT} sayfa üst üste yeni karar bulunmadı. Çekim durduruluyor.")
            break

        time.sleep(1)

    print("\nToplam yeni karar:", len(all_links))

    unique_items = {}

    for item in all_links:
        unique_items[item["basvuru_no"]] = item

    all_links = list(unique_items.values())

    links_path = REPORT_DIR / "v4_guncel_yeni_linkler.txt"
    links_path.write_text(
      "\n".join(item["url"] for item in all_links),
     encoding="utf-8"
    )

    print("=" * 70)
    print("Toplam yeni tekil karar:", len(all_links))
    print("Link listesi:", links_path)
    print("=" * 70)

    found = 0
    skipped = 0
    errors = 0

    if len(all_links) == 0:
        print("Yeni karar bulunmadı. Çekim yapılmadan işlem tamamlandı.")
    else:
        
        for i, item in enumerate(all_links, start=1):
            karar_id = item["id"]
            basvuru_no = item["basvuru_no"]
            url = item["url"]
            safe_no = safe_filename_from_basvuru_no(basvuru_no)

            print(f"{i}/{len(all_links)} API ile çekiliyor: {basvuru_no}")

            if already_exists(basvuru_no):
               skipped += 1
               print("  -> zaten var, geçildi")
               continue

            try:
                detay = fetch_decision_detail(karar_id)

                if not detay:
                    errors += 1
                    save_log(url, basvuru_no, "DETAY_BOS", "")
                    print("  -> detay boş")
                    continue

                html = detay.get("icerik", "")
                text = html_to_text(html)

                if not text:
                    errors += 1
                    save_log(url, basvuru_no, "METIN_BOS", "")
                    print("  -> metin boş")
                    continue

                txt_path = TXT_DIR / f"{safe_no}.txt"
                txt_path.write_text(text, encoding="utf-8")

                save_decision(
                    url,
                    basvuru_no,
                    text,
                    "",
                    detay.get("kararKonusu", "")
                )
                found += 1

                print("  -> OK")
                print("     Başlık:", extract_title(text))
                print("     Tarih:", extract_decision_date(text))
                print("     Sonuç:", infer_sonuc_from_text(text))
                print("     Hak:", infer_hak_from_text(text))
                print("     Uzunluk:", len(text))
                print("     Kalite:", quality_status(text))

            except Exception as e:
                errors += 1
                save_log(url, basvuru_no, "HATA", str(e))
                print("  -> HATA:", e)

            print("-" * 70)

    summary = f"""
Sayfa aralığı: {START_PAGE}-{END_PAGE}
Yeni bulunan karar: {len(all_links)}
Kaydedilen karar: {found}
Atlanan/zaten var: {skipped}
Hata/boş: {errors}

DB:
{DB_PATH}

TXT:
{TXT_DIR}

Link listesi:
{links_path}
"""

    summary_path = REPORT_DIR / "v4_guncel_ozet.txt"
    summary_path.write_text(summary, encoding="utf-8")

    print(summary)


if __name__ == "__main__":
    main()

    print("\n=== CEZAEVİ CLASSIFIER BAŞLATILIYOR ===\n")

    classifier = subprocess.run(
    ["node", "classify-cezaevi.cjs"],
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="ignore"
    )

    print(classifier.stdout)

    if classifier.stderr:
        print("\nCLASSIFIER STDERR:\n")
        print(classifier.stderr)

    print("\n=== AI PIPELINE BAŞLATILIYOR ===\n")

    ai_pipeline = subprocess.run(
    ["node", "ai-auto-pipeline.js"],
    capture_output=True,
    text=True,
    encoding="utf-8",
    errors="ignore"
   )

    print(ai_pipeline.stdout)

    if ai_pipeline.stderr:
        print("\nAI PIPELINE STDERR:\n")
        print(ai_pipeline.stderr)

    print("\n=== TÜM PIPELINE TAMAMLANDI ===\n")