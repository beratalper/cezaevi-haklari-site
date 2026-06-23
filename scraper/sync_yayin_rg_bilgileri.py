from pathlib import Path
import os
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

HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Content-Type": "application/json",
    "Accept": "application/json",
}


def post_search_api(payload, timeout=60, retries=5):
    last_error = None

    for attempt in range(1, retries + 1):
        try:
            response = requests.post(
                SEARCH_API_URL,
                json=payload,
                timeout=timeout,
                headers=HEADERS,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as error:
            last_error = error
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


def main():
    updated = 0
    skipped = 0
    empty = 0
    errors = 0

    for page_no in range(START_PAGE, END_PAGE + 1):
        print(f"\nSayfa: {page_no}")

        try:
            items = collect_items(page_no)
        except Exception as error:
            errors += 1
            print("Liste hatası:", error)
            continue

        if not items:
            print("Boş sayfa, işlem bitti.")
            break

        for item in items:
            karar_id = item.get("id")
            basvuru_no = item.get("basvuruNo")

            if not karar_id or not basvuru_no:
                skipped += 1
                continue

            try:
                detay = fetch_decision_detail(karar_id)

                if not detay:
                    empty += 1
                    print(f"{basvuru_no}: detay bulunamadı")
                    continue

                yayin_tarihi = detay.get("yayinTarihi")
                resmi_gazete_tarihi = detay.get("resmiGazeteTarihi")
                resmi_gazete_sayisi = detay.get("resmiGazeteSayisi")

                if not yayin_tarihi and not resmi_gazete_tarihi and not resmi_gazete_sayisi:
                    empty += 1
                    print(f"{basvuru_no}: yayın/RG bilgisi yok")
                    continue

                supabase.table("kararlar").update({
                    "yayin_tarihi": yayin_tarihi,
                    "resmi_gazete_tarihi": resmi_gazete_tarihi,
                    "resmi_gazete_sayisi": resmi_gazete_sayisi,
                }).eq("basvuru_no", basvuru_no).execute()

                updated += 1
                print(
                    f"{basvuru_no}: "
                    f"yayın={yayin_tarihi}, "
                    f"RG={resmi_gazete_tarihi}, "
                    f"sayı={resmi_gazete_sayisi}"
                )

            except Exception as error:
                errors += 1
                print(f"HATA {basvuru_no}: {error}")

            time.sleep(0.4)

        time.sleep(1)

    print("\nBİTTİ")
    print("Güncellenen:", updated)
    print("Atlanan:", skipped)
    print("Bilgi bulunamayan:", empty)
    print("Hata:", errors)


if __name__ == "__main__":
    main()
