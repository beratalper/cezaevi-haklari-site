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


def clean_spaces(text):
    return re.sub(r"\s+", " ", str(text or "")).strip()


def unique_join(values):
    seen = []

    for value in values:
        value = clean_spaces(value)
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

        if label:
            values.append(label)
        else:
            values.append(f"BİLİNMEYEN:{hid}")

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
                if not detay:
                    empty += 1
                    continue

                hak_ozgurluk_aym = extract_hak_ozgurluk_aym(detay)

                if not hak_ozgurluk_aym:
                    empty += 1
                    print(f"{basvuru_no}: hak bulunamadı")
                    continue

                supabase.table("kararlar").update({
                    "hak_ozgurluk_aym": hak_ozgurluk_aym
                }).eq("basvuru_no", basvuru_no).execute()

                updated += 1
                print(f"{basvuru_no}: {hak_ozgurluk_aym}")

            except Exception as e:
                errors += 1
                print(f"HATA {basvuru_no}: {e}")

            time.sleep(0.4)

        time.sleep(1)

    print("\nBİTTİ")
    print("Güncellenen:", updated)
    print("Hak bulunamayan:", empty)
    print("Hata:", errors)


if __name__ == "__main__":
    main()