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

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY .env içinde bulunamadı.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

BASE_DIR = Path(__file__).resolve().parents[1]
BASE_URL = os.getenv(
    "AYM_BASE_URL",
    "https://kararlarbilgibankasi.anayasa.gov.tr"
)
SEARCH_API_URL = f"{BASE_URL}/api/core/public/search"
TXT_DIR = BASE_DIR / "clean_text"
DB_DIR = BASE_DIR / "db"
REPORT_DIR = BASE_DIR / "reports"
DB_PATH = DB_DIR / "aym_kararlar.db"

START_PAGE = int(os.getenv("AYM_START_PAGE", "1"))
END_PAGE = int(os.getenv("AYM_END_PAGE", "10"))
PAGE_SIZE = int(os.getenv("AYM_PAGE_SIZE", "20"))
ESKI_SAYFA_LIMIT = int(os.getenv("AYM_ESKI_SAYFA_LIMIT", "2"))

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

SEP = " | "

SONUC_ID_MAP = {
    "b0763860-4dff-360f-5aff-28ea7f2c78c2": "Açıkça Dayanaktan Yoksunluk",
    "11886a6d-fc46-f411-de13-8a1a6a551442": "Anayasal ve Kişisel Önemin Olmaması",
    "d0eea5a2-04d9-5d5f-f4cb-109544854adf": "Başvurunun Reddi",
    "3e6382ae-4cc7-0ece-3e02-53cb91548ab6": "Başvuru Yollarının Tüketilmemesi",
    "31826ada-45c1-323f-648b-1b7d47bf3fd6": "Düşme",
    "9cc1d09f-bb91-b607-50a1-6bce536d014d": "İdari Redde İtirazın Reddi",
    "a417a6aa-3a44-c5eb-40d4-61f47a0ee1d3": "İhlal",
    "fafea8f5-cd1f-673b-e49a-388ae95d7658": "İhlal Olmadığı",
    "799feed5-941f-12d6-c00e-6cc926c8f07c": "İncelenmesine Yer Olmadığı",
    "2bf63af1-2581-4d8b-a7f4-6fe5b1e87c37": "İşlemden Kaldırılma",
    "2244756d-5436-e3bf-f18a-4209a7d68304": "Kişi Bakımından Yetkisizlik",
    "9b78ba6a-f4d8-2bc3-225f-f65cf0fac3bf": "Konu Bakımından Yetkisizlik",
    "b1b6dc66-bd70-5ffc-70aa-214574a46480": "Mahkemenin Yetkisizliği",
    "28368648-dc1a-c118-f126-d4f8c7000b25": "Süre Aşımı",
    "2b35f185-3126-de8f-b8fc-ad05ed9d4dcd": "Yer Bakımından Yetkisizlik",
    "3060fe68-1679-af46-31e8-f80c1364c468": "Zaman Bakımından Yetkisizlik",
}

HAK_ID_MAP = {
    "0ee6e0f3-9a12-4bc2-047b-1b6ca220a34f": "Adil Yargılanma Hakkı (Medeni Hak ve Yükümlülükler)",
    "0624f3a7-7e23-6dc7-e659-8ed42ea71b2d": "Adil Yargılanma Hakkı (Suç İsnadı)",
    "df513dbe-f0f7-a266-9b09-fca6f05c5767": "Ayrımcılık Yasağı",
    "abc2ed3c-9301-c091-f08c-8c8d725dd3f0": "Bireysel Başvuru Hakkı",
    "c30de4af-6eb6-a296-28d8-486f36943397": "Din ve Vicdan Özgürlüğü",
    "f274a6bc-fa12-bdc9-7ac9-50a5d0e24e56": "Eğitim Hakkı",
    "ee2d40f6-0700-8a71-bb84-7156735d5aff": "Etkili Başvuru Hakkı",
    "dacae3ac-b5c8-572e-39d0-da737bc7ed45": "Hükmün Denetlenmesini Talep Etme Hakkı",
    "98c42fd3-cd4b-3341-6386-342c13ee25de": "İfade Özgürlüğü",
    "f9636d2e-6ddd-8efe-31d8-238a600d2530": "Kapsam Dışı Haklar",
    "baa65354-710a-0b78-73bd-563698006ba8": "Kişi Özgürlüğü ve Güvenliği Hakkı",
    "e584c9f9-972b-7037-e116-3dfc4cd084ae": "Kötü Muamele Yasağı",
    "bf4889b4-3846-fd97-45c4-3c66c3a4783b": "Maddi ve Manevi Varlığın Korunması Hakkı",
    "1efc25f1-6a86-7f1d-4344-10e4a104b51a": "Mülkiyet Hakkı",
    "f9a279c5-7e56-785f-8881-5cbcdff64ad3": "Örgütlenme Özgürlüğü",
    "8a343193-3a9e-2d52-f4ee-1a9f20da4b94": "Özel Hayata ve Aile Hayatına Saygı Hakkı",
    "5b310833-4fcd-92ec-820f-435663855a2c": "Seçme, Seçilme ve Siyasi Faaliyette Bulunma Hakkı",
    "ff712e74-c07f-402d-21fe-c193edebc8ca": "Sendika Hakkı",
    "0aa222e1-4c6d-bc17-9976-2754edd05e5f": "Suç ve Cezaların Kanuniliği İlkesi",
    "ab36f621-7831-e591-869c-76084722ab37": "Toplantı ve Gösteri Yürüyüşü Düzenleme Hakkı",
    "a561e550-845a-e83c-67c9-540cd2b936e4": "Yaşam Hakkı",
    "6a1c2a39-55a1-4cb8-a4b2-fe673574d7f3": "Yerleşme Hürriyeti",
    "afe96663-681e-0a90-cb67-088fc70a8407": "Zorla Çalıştırma ve Angarya Yasağı",
}

SONUC_MAP = {
    "İHLAL": "İhlal",
    "IHLAL": "İhlal",
    "İHLAL OLMADIĞI": "İhlal Olmadığı",
    "IHLAL OLMADIĞI": "İhlal Olmadığı",
    "AÇIKÇA DAYANAKTAN YOKSUNLUK": "Açıkça Dayanaktan Yoksunluk",
    "BAŞVURU YOLLARININ TÜKETİLMEMESİ": "Başvuru Yollarının Tüketilmemesi",
    "SÜRE AŞIMI": "Süre Aşımı",
    "DÜŞME": "Düşme",
    "KONU BAKIMINDAN YETKİSİZLİK": "Konu Bakımından Yetkisizlik",
    "KİŞİ BAKIMINDAN YETKİSİZLİK": "Kişi Bakımından Yetkisizlik",
    "ZAMAN BAKIMINDAN YETKİSİZLİK": "Zaman Bakımından Yetkisizlik",
    "BAŞVURUNUN REDDİ": "Başvurunun Reddi",
    "İNCELENMESİNE YER OLMADIĞI": "İncelenmesine Yer Olmadığı",
    "KARAR VERİLMESİNE YER OLMADIĞI": "Karar Verilmesine Yer Olmadığı",
    "ANAYASAL VE KİŞİSEL ÖNEMİN OLMAMASI": "Anayasal ve Kişisel Önemin Olmaması",
    "İŞLEMDEN KALDIRILMA": "İşlemden Kaldırılma",
    "KABUL EDİLEMEZ": "Kabul Edilemez",
    "RET": "Ret",
}

HAK_MAP = {
    "ADIL YARGILANMA HAKKI": "Adil Yargılanma Hakkı",
    "ADİL YARGILANMA HAKKI": "Adil Yargılanma Hakkı",
    "ADIL YARGILANMA HAKKI (MEDENI HAK VE YÜKÜMLÜLÜKLER)": "Adil Yargılanma Hakkı (Medeni Hak ve Yükümlülükler)",
    "ADİL YARGILANMA HAKKI (MEDENİ HAK VE YÜKÜMLÜLÜKLER)": "Adil Yargılanma Hakkı (Medeni Hak ve Yükümlülükler)",
    "ADIL YARGILANMA HAKKI (SUÇ İSNADI)": "Adil Yargılanma Hakkı (Suç İsnadı)",
    "ADİL YARGILANMA HAKKI (SUÇ İSNADI)": "Adil Yargılanma Hakkı (Suç İsnadı)",
    "MÜLKIYET HAKKI": "Mülkiyet Hakkı",
    "MÜLKİYET HAKKI": "Mülkiyet Hakkı",
    "İFADE ÖZGÜRLÜĞÜ": "İfade Özgürlüğü",
    "IFADE ÖZGÜRLÜĞÜ": "İfade Özgürlüğü",
    "KÖTÜ MUAMELE YASAĞI": "Kötü Muamele Yasağı",
    "YAŞAM HAKKI": "Yaşam Hakkı",
    "KİŞİ ÖZGÜRLÜĞÜ VE GÜVENLİĞİ HAKKI": "Kişi Özgürlüğü ve Güvenliği Hakkı",
    "KIŞI ÖZGÜRLÜĞÜ VE GÜVENLIĞI HAKKI": "Kişi Özgürlüğü ve Güvenliği Hakkı",
    "KİŞİ HÜRRİYETİ VE GÜVENLİĞİ HAKKI": "Kişi Özgürlüğü ve Güvenliği Hakkı",
    "KIŞI HÜRRIYETI VE GÜVENLIĞI HAKKI": "Kişi Özgürlüğü ve Güvenliği Hakkı",
    "ÖZEL HAYATA SAYGI HAKKI": "Özel Hayata Saygı Hakkı",
    "AİLE HAYATINA SAYGI HAKKI": "Aile Hayatına Saygı Hakkı",
    "AILE HAYATINA SAYGI HAKKI": "Aile Hayatına Saygı Hakkı",
    "ÖZEL HAYATIN VE AİLE HAYATININ KORUNMASI HAKKI": "Özel Hayatın ve Aile Hayatının Korunması Hakkı",
    "EĞITIM HAKKI": "Eğitim Hakkı",
    "EĞİTİM HAKKI": "Eğitim Hakkı",
    "SENDIKA HAKKI": "Sendika Hakkı",
    "SENDİKA HAKKI": "Sendika Hakkı",
    "TOPLANTI VE GÖSTERI YÜRÜYÜŞÜ DÜZENLEME HAKKI": "Toplantı ve Gösteri Yürüyüşü Düzenleme Hakkı",
    "TOPLANTI VE GÖSTERİ YÜRÜYÜŞÜ DÜZENLEME HAKKI": "Toplantı ve Gösteri Yürüyüşü Düzenleme Hakkı",
    "SUÇ VE CEZALARIN KANUNILIĞI ILKESI": "Suç ve Cezaların Kanuniliği İlkesi",
    "SUÇ VE CEZALARIN KANUNİLİĞİ İLKESİ": "Suç ve Cezaların Kanuniliği İlkesi",
    "GEREKÇELI KARAR HAKKI": "Gerekçeli Karar Hakkı",
    "GEREKÇELİ KARAR HAKKI": "Gerekçeli Karar Hakkı",
    "MAHKEMEYE ERIŞIM HAKKI": "Mahkemeye Erişim Hakkı",
    "MAHKEMEYE ERİŞİM HAKKI": "Mahkemeye Erişim Hakkı",
    "ETKILI BAŞVURU HAKKI": "Etkili Başvuru Hakkı",
    "ETKİLİ BAŞVURU HAKKI": "Etkili Başvuru Hakkı",
    "MASUMIYET KARINESI": "Masumiyet Karinesi",
    "MASUMİYET KARİNESİ": "Masumiyet Karinesi",
    "AYRIMCILIK YASAĞI": "Ayrımcılık Yasağı",
    "KAPSAM DIŞI HAKLAR": "Kapsam Dışı Haklar",
    "DIN VE VICDAN ÖZGÜRLÜĞÜ": "Din ve Vicdan Özgürlüğü",
    "DİN VE VİCDAN ÖZGÜRLÜĞÜ": "Din ve Vicdan Özgürlüğü",
    "ÖRGÜTLENME ÖZGÜRLÜĞÜ": "Örgütlenme Özgürlüğü",
    "HÜKMÜN DENETLENMESİNİ TALEP ETME HAKKI": "Hükmün Denetlenmesini Talep Etme Hakkı",
    "BİREYSEL BAŞVURU HAKKI": "Bireysel Başvuru Hakkı",
    "ZORLA ÇALIŞTIRMA VE ANGARYA YASAĞI": "Zorla Çalıştırma ve Angarya Yasağı",
    "YERLEŞME HÜRRİYETİ": "Yerleşme Hürriyeti",
}



def clean_spaces(text):
    return re.sub(r"\s+", " ", str(text or "")).strip()


def unique_join(values):
    seen = []

    for value in values:
        value = clean_spaces(value)
        if value and value not in seen:
            seen.append(value)

    return SEP.join(seen)


def split_values(value):
    if not value:
        return []

    value = str(value)
    value = value.replace(" - ", ";")
    value = value.replace(" | ", ";")
    value = value.replace(",", ";")
    return [v.strip() for v in value.split(";") if v.strip()]


def normalize_piece(piece, mapping):
    key = re.sub(r"\s+", " ", str(piece or "").strip()).upper()
    return mapping.get(key, str(piece or "").strip().title())


def normalize_multi(value, mapping):
    parts = [normalize_piece(p, mapping) for p in split_values(value)]

    seen = []
    for p in parts:
        if p and p not in seen:
            seen.append(p)

    return SEP.join(seen)


def extract_sonuc_aym(detay):
    rows = detay.get("bireyselBasvuruIncelemeGerekceleri") or []
    values = []

    for row in rows:
        if not isinstance(row, dict):
            continue

        sid = row.get("sonucTanimParamId")
        if not sid:
            continue

        label = SONUC_ID_MAP.get(str(sid).lower())
        values.append(label if label else f"BİLİNMEYEN:{sid}")

    return unique_join(values)


def extract_hak_ozgurluk_aym(detay):
    rows = detay.get("bireyselBasvuruIncelemeGerekceleri") or []
    values = []

    for row in rows:
        if not isinstance(row, dict):
            continue

        hid = row.get("hakTanimId")
        if not hid:
            continue

        label = HAK_ID_MAP.get(str(hid).lower())
        values.append(label if label else f"BİLİNMEYEN:{hid}")

    return unique_join(values)



def html_to_text(html, separator=" "):
    soup = BeautifulSoup(html or "", "html.parser")
    return clean_spaces(soup.get_text(separator, strip=True))


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


def karar_url_from_id(karar_id):
    raw = f"kbb:{karar_id}"
    encoded = base64.urlsafe_b64encode(raw.encode("utf-8")).decode("utf-8").rstrip("=")
    return f"{BASE_URL}/kbb/pages/search/BireyselBasvuru?id={encoded}&type=BireyselBasvuru"


def post_search_api(payload, timeout=60, retries=5):
    last_error = None

    for attempt in range(1, retries + 1):
        try:
            r = requests.post(
                SEARCH_API_URL,
                json=payload,
                timeout=timeout,
                headers=HEADERS
            )
            r.raise_for_status()
            return r.json()

        except requests.exceptions.ReadTimeout as e:
            last_error = e
            wait = attempt * 5
            print(f"Timeout oldu. {wait} sn bekleyip tekrar denenecek... ({attempt}/{retries})")
            time.sleep(wait)

        except requests.exceptions.RequestException as e:
            last_error = e
            wait = attempt * 5
            print(f"API hatası. {wait} sn bekleyip tekrar denenecek... ({attempt}/{retries})")
            time.sleep(wait)

    raise last_error


def collect_links_from_page(page_no):
    print(f"Liste API okunuyor: page={page_no}")

    payload = {
        "kararTipi": "BireyselBasvuru",
        "page": page_no,
        "size": PAGE_SIZE,
        "sort": "yayinTarihi",
        "order": "desc",
    }

    data = post_search_api(payload)
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

    data = post_search_api(payload)
    kararlar = data.get("data", [])

    if kararlar:
        return kararlar[0]

    return None


def safe_filename_from_basvuru_no(basvuru_no):
    return basvuru_no.replace("/", "_")


def extract_title(text):
    patterns = [
        r"KARAR\s+(.+?BAŞVURUSU(?:\s*\(\d+\))?)\s*\(Başvuru Numarası:",
        r"KARAR\s+(.+?)\s*\(Başvuru Numarası:",
        r"(.+?BAŞVURUSU(?:\s*\(\d+\))?)\s*\(Başvuru Numarası:",
    ]

    for pat in patterns:
        m = re.search(pat, text, flags=re.DOTALL)
        if m:
            title = clean_spaces(m.group(1))
            title = re.sub(r"^(TÜRKİYE CUMHURİYETİ ANAYASA MAHKEMESİ\s+)?", "", title)
            title = re.sub(r"^(BİRİNCİ|İKİNCİ|GENEL KURUL)\s+BÖLÜM\s+KARAR\s+", "", title)
            title = re.sub(r"^KARAR\s+", "", title)
            return title

    return ""


def extract_decision_date(text):
    m = re.search(r"Karar Tarihi\s*:\s*([0-9]{1,2}/[0-9]{1,2}/[0-9]{4})", text)
    if m:
        return m.group(1)
    return ""


def normalize_for_search(text):
    upper = (text or "").upper()
    upper = upper.replace("İ", "I")
    upper = upper.replace("Ğ", "G")
    upper = upper.replace("Ü", "U")
    upper = upper.replace("Ş", "S")
    upper = upper.replace("Ö", "O")
    upper = upper.replace("Ç", "C")
    upper = re.sub(r"\s+", " ", upper)
    return upper


def extract_hukum_section(text):
    """
    Sonuç tespitinde gerekçe içindeki kelimeler yanıltmasın diye mümkünse hüküm
    bölümünü kullanır. Hüküm başlığı bulunamazsa metnin son 6000 karakterine düşer.
    """
    m = re.search(r"(?:^|\s)(?:IV|V|VI|VII|VIII)\.\s*HÜKÜM\s*(.*)$", text or "", flags=re.DOTALL)
    if m:
        return m.group(1)
    return (text or "")[-6000:]


def infer_sonuc_from_text(text):
    hukum = extract_hukum_section(text)
    norm = normalize_for_search(hukum)

    # Sıra önemli: "ihlal edilmedi" ifadesi, "ihlal edildi" kontrolünden önce gelmeli.
    if (
        "KARAR VERILMESINE YER OLMADIGINA" in norm
        or "KARAR VERILMESINE YER OLMADIGI" in norm
    ):
        return "KARAR VERİLMESİNE YER OLMADIĞI"

    if (
        "IHLAL EDILMEDIGINE" in norm
        or "IHLAL EDILMEDIGI" in norm
        or "IHLAL EDILMEGINE" in norm
    ):
        return "İHLAL OLMADIĞI"

    if (
        "IHLAL EDILDIGINE" in norm
        or "IHLAL EDILDIGI" in norm
        or "IHLAL EDILDI GINE" in norm
    ):
        return "İHLAL"

    if (
        "KABUL EDILEMEZ" in norm
        or "KABULEDILEMEZ" in norm
        or "KABUL EDILEBILEMEZ" in norm
    ):
        return "KABUL EDİLEMEZ"

    if (
        "DUSMESINE" in norm
        or "ISLEMDEN KALDIRILMASINA" in norm
        or "BASVURUNUN ISLEMDEN KALDIRILMASINA" in norm
    ):
        return "DÜŞME"

    if "REDDINE" in norm:
        return "RET"

    return ""


def infer_hak_from_api(value):
    """
    AYM API'deki bireyselAnayasaHukum alanı bazen liste/dict/string olabilir.
    Kullanılabilir hak/özgürlük etiketlerini yakalarsa metin taramasından önce bunu kullanır.
    """
    if not value:
        return ""

    candidates = []

    def walk(obj):
        if isinstance(obj, str):
            candidates.append(obj)
        elif isinstance(obj, dict):
            preferred_keys = [
                "label", "name", "ad", "baslik", "hukum", "madde",
                "anayasaHukumLabel", "bireyselAnayasaHukumLabel"
            ]
            for key in preferred_keys:
                if key in obj:
                    walk(obj.get(key))
            for key, val in obj.items():
                if key not in preferred_keys:
                    walk(val)
        elif isinstance(obj, list):
            for item in obj:
                walk(item)

    walk(value)

    found = []
    for item in candidates:
        cleaned = clean_spaces(item)
        low = cleaned.lower()
        if any(marker in low for marker in ["hakk", "özgür", "hürriyet", "yasağ", "ilke"]):
            found.append(cleaned.upper())

    return ", ".join(dict.fromkeys(found))


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
        "aile hayatına saygı hakkı",
        "haberleşme hürriyeti",
        "eğitim hakkı",
        "sendika hakkı",
        "toplantı ve gösteri yürüyüşü düzenleme hakkı",
        "din ve vicdan özgürlüğü",
        "etkili başvuru hakkı",
        "suç ve cezaların kanuniliği ilkesi",
        "maddi ve manevi varlığın korunması ve geliştirilmesi hakkı",
        "mahkemeye erişim hakkı",
        "gerekçeli karar hakkı",
        "masumiyet karinesi",
    ]

    lower = (text or "").lower()
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

    s += len(start)
    e = info.find(end, s)
    konu = info[s:e] if e != -1 else info[s:]
    return clean_spaces(konu)


def cleanup_basvuru_konusu(konu):
    konu = html_to_text(konu) if "<" in (konu or "") and ">" in (konu or "") else clean_spaces(konu)

    # kararKonusu bazen "1. Başvuru ... 2. ..." formatında gelebiliyor.
    if konu.startswith("1. Başvuru"):
        konu = re.sub(r"\s+2\.\s+.*$", "", konu, flags=re.DOTALL)
        konu = re.sub(r"^1\.\s*", "", konu)

    # Eski bazı metinlerde "Başvurular;" kullanılıyor; sorun değil.
    return clean_spaces(konu)


def infer_basvuru_konusu_from_text(text):
    patterns = [
        r"I\.\s*BAŞVURUNUN KONUSU\s*(.*?)(?:II\.\s*BAŞVURU SÜRECİ|II\.\s*OLAY VE OLGULAR|II\.\s*DEĞERLENDİRME)",
        r"I\.\s*BAŞVURU KONUSU\s*(.*?)(?:II\.\s*BAŞVURU SÜRECİ|II\.\s*OLAY VE OLGULAR|II\.\s*DEĞERLENDİRME)",
        r"I\.\s*BAŞVURUNUN ÖZETİ\s*(.*?)(?:II\.\s*DEĞERLENDİRME|II\.\s*BAŞVURU SÜRECİ|II\.\s*OLAY VE OLGULAR)",
    ]

    for pat in patterns:
        m = re.search(pat, text or "", flags=re.DOTALL)
        if m:
            return cleanup_basvuru_konusu(m.group(1))

    return ""


def quality_status(text, karar_konusu="", sonuc="", karar_adi=""):
    problems = []

    if len(text or "") < 800:
        problems.append("çok_kısa")

    if (
        "TÜRKİYE CUMHURİYETİ ANAYASA MAHKEMESİ" not in (text or "")
        and "ANAYASA MAHKEMESİ" not in (text or "")
        and "REPUBLIC OF TURKEY CONSTITUTIONAL COURT" not in (text or "")
    ):
        problems.append("başlık_yok")

    if (
        "BAŞVURUNUN KONUSU" not in (text or "")
        and "BAŞVURU KONUSU" not in (text or "")
        and "BAŞVURUNUN ÖZETİ" not in (text or "")
        and "SUBJECT OF APPLICATION" not in (text or "")
        and "SUBJECT-MATTER OF THE APPLICATION" not in (text or "")
    ):
        problems.append("konu_bölümü_yok")

    if not karar_konusu:
        problems.append("basvuru_konusu_boş")

    if not sonuc:
        problems.append("sonuc_boş")

    if not karar_adi:
        problems.append("karar_adi_boş")

    bad_markers = [
        "KARAR KİMLİK BİLGİLERİ Başvuru No",
        "Hak/Özgürlük",
        "T.C. Anayasa Mahkemesi Norm Denetimi",
        "ADRES Ahlatlıbel",
        "İLETİŞİM BİLGİLERİ",
    ]

    for marker in bad_markers:
        if marker in (text or ""):
            problems.append(f"kirli_marker:{marker}")

    return "; ".join(problems) if problems else "OK"


def init_db():
    DB_DIR.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

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


def save_atiflar(karar_basvuru_no, atiflar):
    if not atiflar:
        return 0

    rows = []

    for item in atiflar:
        if not isinstance(item, dict):
            continue

        atif_no = clean_spaces(
            item.get("atifKararNo")
            or item.get("basvuruNo")
            or item.get("basvuru_no")
            or ""
        )

        if not atif_no:
            continue

        rows.append({
            "karar_basvuru_no": karar_basvuru_no,
            "atif_karar_adi": clean_spaces(
                item.get("kararAdi")
                or item.get("basvuruAdi")
                or item.get("ad")
                or item.get("label")
                or ""
            ),
            "atif_basvuru_no": atif_no,
            "raw_text": str(item),
        })

    if not rows:
        return 0

    supabase.table("karar_atiflari").upsert(
        rows,
        on_conflict="karar_basvuru_no,atif_basvuru_no"
    ).execute()

    return len(rows)


def save_decision(url, basvuru_no, text, detay):
    karar_konusu = cleanup_basvuru_konusu(detay.get("kararKonusu", ""))

    if karar_konusu == "":
        karar_konusu = extract_basvuru_konusu_from_info_form(
            detay.get("bilgiFormu", "") or detay.get("bilgiFormuIcerik", "")
        )

    if karar_konusu == "":
        karar_konusu = infer_basvuru_konusu_from_text(text)

    karar_adi = extract_title(text)

    sonuc_raw = infer_sonuc_from_text(text)
    sonuc = normalize_multi(sonuc_raw, SONUC_MAP) or sonuc_raw
    sonuc_aym = extract_sonuc_aym(detay) or sonuc

    hak_raw = infer_hak_from_api(detay.get("bireyselAnayasaHukum")) or infer_hak_from_text(text)
    hak = normalize_multi(hak_raw, HAK_MAP) or hak_raw
    hak_ozgurluk_aym = extract_hak_ozgurluk_aym(detay) or hak

    karar_tarihi = extract_decision_date(text)

    data = {
        "basvuru_no": basvuru_no,
        "karar_adi": karar_adi,
        "karar_tarihi": karar_tarihi,
        "bilgi_formu_karar_tarihi": extract_decision_date(
            detay.get("bilgiFormu", "") or detay.get("bilgiFormuIcerik", "")
        ),
        "yayin_tarihi": detay.get("yayinTarihi"),
        "resmi_gazete_tarihi": detay.get("resmiGazeteTarihi"),
        "resmi_gazete_sayisi": detay.get("resmiGazeteSayisi"),
        "sonuc": sonuc,
        "sonuc_aym": sonuc_aym,
        "mudahale_iddiasi_aym": hak,
        "hak_ozgurluk_aym": hak_ozgurluk_aym,
        "basvuru_konusu": karar_konusu,
        "metin": text,
        "aym_url": url,
    }

    atif_sayisi = save_atiflar(
        basvuru_no,
        detay.get("bireyselBasvuruAtifYapilanKararlar")
    )

    supabase.table("kararlar").upsert(data, on_conflict="basvuru_no").execute()

    return {
        "karar_adi": karar_adi,
        "karar_tarihi": karar_tarihi,
        "sonuc": sonuc,
        "sonuc_aym": sonuc_aym,
        "hak": hak,
        "hak_ozgurluk_aym": hak_ozgurluk_aym,
        "basvuru_konusu": karar_konusu,
        "atif_sayisi": atif_sayisi,
        "kalite": quality_status(text, karar_konusu, sonuc_aym or sonuc, karar_adi),
    }


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


def run_node_step(command, label):
    print(f"\n=== {label} BAŞLATILIYOR ===\n")

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="ignore"
    )

    if result.stdout:
        print(result.stdout)

    if result.stderr:
        print(f"\n{label} STDERR:\n")
        print(result.stderr)

    if result.returncode != 0:
        print(f"{label} hata kodu ile bitti: {result.returncode}")

    return result.returncode == 0


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

    unique_items = {}
    for item in all_links:
        unique_items[item["basvuru_no"]] = item
    all_links = list(unique_items.values())

    links_path = REPORT_DIR / "v4_guncel_yeni_linkler.txt"
    links_path.write_text("\n".join(item["url"] for item in all_links), encoding="utf-8")

    print("=" * 70)
    print("Toplam yeni tekil karar:", len(all_links))
    print("Link listesi:", links_path)
    print("=" * 70)

    found = 0
    skipped = 0
    errors = 0
    quality_rows = []

    if len(all_links) == 0:
        print("Yeni karar bulunmadı. Çekim yapılmadan işlem tamamlandı.")
    else:
        for i, item in enumerate(all_links, start=1):
            karar_id = item["id"]
            basvuru_no = item["basvuru_no"]
            url = item["url"]
            safe_no = safe_filename_from_basvuru_no(basvuru_no)

            print(f"{i}/{len(all_links)} API ile çekiliyor: {basvuru_no}")

            if karar_dbde_var_mi(basvuru_no):
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

                text = html_to_text(detay.get("icerik", ""), separator="\n")

                if not text:
                    errors += 1
                    save_log(url, basvuru_no, "METIN_BOS", "")
                    print("  -> metin boş")
                    continue

                txt_path = TXT_DIR / f"{safe_no}.txt"
                txt_path.write_text(text, encoding="utf-8")

                extracted = save_decision(url, basvuru_no, text, detay)
                found += 1

                if extracted["kalite"] != "OK":
                    quality_rows.append(f"{basvuru_no}\t{extracted['kalite']}")

                print("  -> OK")
                print("     Başlık:", extracted["karar_adi"])
                print("     Tarih:", extracted["karar_tarihi"])
                print("     Sonuç:", extracted["sonuc"])
                print("     Sonuç AYM:", extracted["sonuc_aym"])
                print("     Hak:", extracted["hak"])
                print("     Hak/Özgürlük AYM:", extracted["hak_ozgurluk_aym"])
                print("     Referans karar sayısı:", extracted["atif_sayisi"])
                print("     Başvuru konusu:", extracted["basvuru_konusu"][:160])
                print("     Uzunluk:", len(text))
                print("     Kalite:", extracted["kalite"])

            except Exception as e:
                errors += 1
                save_log(url, basvuru_no, "HATA", str(e))
                print("  -> HATA:", e)

            print("-" * 70)

    quality_path = REPORT_DIR / "v4_guncel_kalite_sorunlari.txt"
    quality_path.write_text("\n".join(quality_rows), encoding="utf-8")

    summary = f"""
Sayfa aralığı: {START_PAGE}-{END_PAGE}
Yeni bulunan karar: {len(all_links)}
Kaydedilen karar: {found}
Atlanan/zaten var: {skipped}
Hata/boş: {errors}
Kalite sorunu: {len(quality_rows)}

DB:
{DB_PATH}

TXT:
{TXT_DIR}

Link listesi:
{links_path}

Kalite raporu:
{quality_path}
"""

    summary_path = REPORT_DIR / "v4_guncel_ozet.txt"
    summary_path.write_text(summary, encoding="utf-8")

    print(summary)
    return found


if __name__ == "__main__":
    found = main()

    if found == 0:
        print("\nYeni karar yok. Classifier ve AI pipeline çalıştırılmadı.\n")
    else:
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