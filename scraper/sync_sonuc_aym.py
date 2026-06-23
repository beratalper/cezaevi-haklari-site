from pathlib import Path
import os
import re
import time
import requests
from dotenv import load_dotenv
from supabase import create_client

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(dotenv_path=BASE_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

BASE_URL = os.getenv(
    "AYM_BASE_URL",
    "https://kararlarbilgibankasi.anayasa.gov.tr"
)

SEARCH_API_URL = f"{BASE_URL}/api/core/public/search"

START_PAGE = 1
END_PAGE = 900
PAGE_SIZE = 20
SEP = " | "

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

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


def clean_spaces(text):
    return re.sub(r"\s+", " ", str(text or "")).strip()


def normalize_sonuc(value):
    value = clean_spaces(value)
    if not value:
        return ""

    key = value.upper()
    key = key.replace("İ", "İ")
    key = re.sub(r"\s+", " ", key)

    return SONUC_MAP.get(key, value.title())


def unique_join(values):
    seen = []

    for value in values:
        value = normalize_sonuc(value)
        if value and value not in seen:
            seen.append(value)

    return SEP.join(seen)


def post_search_api(payload, timeout=60, retries=5):
    last_error = None

    for attempt in range(1, retries + 1):
        try:
            r = requests.post(
                SEARCH_API_URL,
                json=payload,
                timeout=timeout,
                headers=HEADERS,
            )
            r.raise_for_status()
            return r.json()

        except requests.exceptions.RequestException as e:
            last_error = e
            wait = attempt * 5
            print(f"API hatası. {wait} sn sonra tekrar denenecek... ({attempt}/{retries})")
            time.sleep(wait)

    raise last_error


def collect_items(page_no):
    payload = {
        "kararTipi": "BireyselBasvuru",
        "page": page_no,
        "size": PAGE_SIZE,
        "sort": "yayinTarihi",
        "order": "desc",
    }

    data = post_search_api(payload)
    return data.get("data", [])


def fetch_decision_detail(karar_id):
    payload = {
        "id": karar_id,
        "size": 1,
        "kararTipi": "BireyselBasvuru",
    }

    data = post_search_api(payload)
    kararlar = data.get("data", [])
    return kararlar[0] if kararlar else None


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

        if label:
            values.append(label)
        else:
            values.append(f"BİLİNMEYEN:{sid}")

    return unique_join(values)


def main():
    updated = 0
    empty = 0
    errors = 0

    for page_no in range(START_PAGE, END_PAGE + 1):
        print(f"\nSayfa: {page_no}")

        try:
            items = collect_items(page_no)
        except Exception as e:
            errors += 1
            print("Liste hatası:", e)
            continue

        if not items:
            print("Boş sayfa, işlem bitti.")
            break

        for item in items:
            karar_id = item.get("id")
            basvuru_no = item.get("basvuruNo")

            if not karar_id or not basvuru_no:
                continue

            try:
                detay = fetch_decision_detail(karar_id)
                import json

                if not detay:
                    empty += 1
                    continue

                sonuc_aym = extract_sonuc_aym(detay)

                if not sonuc_aym:
                    empty += 1
                    print(f"{basvuru_no}: sonuç bulunamadı")
                    continue

                supabase.table("kararlar").update({
                    "sonuc_aym": sonuc_aym
                }).eq("basvuru_no", basvuru_no).execute()

                updated += 1
                print(f"{basvuru_no}: {sonuc_aym}")

            except Exception as e:
                errors += 1
                print(f"HATA {basvuru_no}: {e}")

            time.sleep(0.4)

        time.sleep(1)

    print("\nBİTTİ")
    print("Güncellenen:", updated)
    print("Sonuç bulunamayan:", empty)
    print("Hata:", errors)


if __name__ == "__main__":
    main()