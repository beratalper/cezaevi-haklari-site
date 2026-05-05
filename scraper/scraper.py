from pathlib import Path
import re
import sqlite3
import time
from urllib.parse import urljoin
import os

from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from supabase import create_client, Client

env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print("ENV PATH:", env_path)
print("ENV TEST:", SUPABASE_URL)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

BASE_DIR = Path(__file__).resolve().parents[1]
BASE_URL = "https://kararlarbilgibankasi.anayasa.gov.tr"
TXT_DIR = BASE_DIR / "clean_text"
DB_DIR = BASE_DIR / "db"
REPORT_DIR = BASE_DIR / "reports"

DB_PATH = DB_DIR / "aym_kararlar.db"

START_PAGE = 1
END_PAGE = 10
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


def basvuru_no_from_url(url):
    if "/BB/" in url:
        return url.rstrip("/").split("/BB/")[-1]

    return url.rstrip("/").split("/")[-1]

def clean_spaces(text):
    return re.sub(r"\s+", " ", text or "").strip()


def collect_links_from_page(page_no):
    url = f"{BASE_URL}?page={page_no}"
    print(f"Liste sayfası okunuyor: {url}")

    r = requests.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
    r.raise_for_status()

    soup = BeautifulSoup(r.text, "html.parser")
    links = []

    for a in soup.find_all("a", href=True):
        href = a["href"]

        if re.search(r"/BB/\d{4}/\d+", href):
            full_url = urljoin(BASE_URL, href)
            full_url = full_url.split("?")[0]
            links.append(full_url)

    unique_links = list(dict.fromkeys(links))
    print(f"Bu sayfada bulunan karar linki: {len(unique_links)}")
    return unique_links


def cut_decision_text(raw_text):
    text = clean_spaces(raw_text)

    start_markers = [
        "TÜRKİYE CUMHURİYETİ ANAYASA MAHKEMESİ",
        "REPUBLIC OF TURKEY CONSTITUTIONAL COURT",
        "ANAYASA MAHKEMES",
    ]

    starts = []
    for marker in start_markers:
        pos = text.find(marker)
        if pos != -1:
            starts.append(pos)
    # en alttaki marker'? kullanaca??z

    if not starts:
        return ""

    text = text[max(starts):]

    end_markers = [
        "I. KARAR KİMLİK BİLGİLERİ",
        "I. CASE DETAILS",
        "ADRES Ahlatlıbel",
        "ADDRESS Ahlatlıbel",
        "İLETİŞİM BİLGİLERİ",
        "CONTACT INFORMATION",
    ]

    ends = []
    for marker in end_markers:
        pos = text.find(marker)
        if pos > 1000:
            ends.append(pos)

    if ends:
        text = text[:min(ends)]

    return clean_spaces(text)


def extract_basvuru_no_from_url(url):
    m = re.search(r"/BB/(\d{4})/(\d+)", url)
    if not m:
        return ""
    return f"{m.group(1)}/{m.group(2)}"


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

    if "KABUL EDİLEMEZ OLDUĞUNA" in upper:
        return "KABUL EDİLEMEZ"

    if "İHLAL EDİLMEDİĞİNE" in upper:
        return "İHLAL OLMADIĞI"

    if "İHLAL EDİLDİĞİNE" in upper:
        return "İHLAL"

    if "DÜŞMESİNE" in upper:
        return "DÜŞME"

    if "REDDİNE" in upper:
        return "RET"

    if "KARAR VERİLMESİNE YER OLMADIĞINA" in upper:
        return "KARAR VERİLMESİNE YER OLMADIĞI"

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


def save_decision(url, basvuru_no, text, bilgi_formu_text):
    sonuc = infer_sonuc_from_text(text)
    hak = infer_hak_from_text(text)

    basvuru_konusu = extract_basvuru_konusu_from_info_form(bilgi_formu_text)

    if basvuru_konusu == "":
        basvuru_konusu = infer_basvuru_konusu_from_text(text)

    data = {
        "basvuru_no": basvuru_no,
        "karar_adi": extract_title(text),
        "karar_tarihi": extract_decision_date(text),
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
        links = collect_links_from_page(page_no)

        print(f"\nSayfa {page_no} kontrol ediliyor...")
        print("Bu sayfadaki link sayısı:", len(links))

        yeni_links = []

        for url in links:
            basvuru_no = basvuru_no_from_url(url)

            if karar_dbde_var_mi(basvuru_no):
                print("Zaten var:", basvuru_no)
            else:
                print("Yeni karar:", basvuru_no)
                yeni_links.append(url)

        if yeni_links:
            eski_sayfa_ust_uste = 0
            all_links.extend(yeni_links)
        else:
            eski_sayfa_ust_uste += 1
            print("Bu sayfadaki tüm kararlar zaten DB'de var.")

        if eski_sayfa_ust_uste >= ESKI_SAYFA_LIMIT:
            print(f"\n{ESKI_SAYFA_LIMIT} sayfa üst üste yeni karar bulunmadı. Çekim durduruluyor.")
            break

        time.sleep(1)
        
    print("\nToplam yeni link:", len(all_links))

    all_links = list(dict.fromkeys(all_links))

    links_path = REPORT_DIR / "v4_guncel_yeni_linkler.txt"
    links_path.write_text("\n".join(all_links), encoding="utf-8")

    print("=" * 70)
    print("Toplam yeni tekil karar linki:", len(all_links))
    print("Link listesi:", links_path)
    print("=" * 70)

    found = 0
    skipped = 0
    errors = 0

    if len(all_links) == 0:
        print("Yeni karar bulunmadı. Çekim yapılmadan işlem tamamlandı.")
    else:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False)
            page = browser.new_page()

            for i, url in enumerate(all_links, start=1):
                basvuru_no = extract_basvuru_no_from_url(url)
                safe_no = safe_filename_from_basvuru_no(basvuru_no)

                print(f"{i}/{len(all_links)} çekiliyor: {basvuru_no}")

                if already_exists(basvuru_no):
                    skipped += 1
                    print("  -> zaten var, geçildi")
                    continue

                try:
                    page.goto(url, wait_until="networkidle", timeout=60000)
                    time.sleep(2)

                    raw_text = page.locator("body").inner_text()
                    text = cut_decision_text(raw_text)

                    try:
                        page.get_by_text("KARAR BİLGİ FORMU", exact=True).click()
                        time.sleep(1)
                        bilgi_formu_text = page.locator("body").inner_text()
                    except Exception:
                        bilgi_formu_text = ""

                    if not text:
                        errors += 1
                        save_log(url, basvuru_no, "METIN_BOS", raw_text[:500])
                        print("  -> metin boş / karar başlangıcı bulunamadı")
                        continue

                    txt_path = TXT_DIR / f"{safe_no}.txt"
                    txt_path.write_text(text, encoding="utf-8")

                    save_decision(url, basvuru_no, text, bilgi_formu_text)
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

            browser.close()

    summary = f"""
Sayfa aralığı: {START_PAGE}-{END_PAGE}
Yeni bulunan link: {len(all_links)}
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
