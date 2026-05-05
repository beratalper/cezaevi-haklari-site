import sys
import time
from playwright.sync_api import sync_playwright

from scraper.scraper import (
    extract_basvuru_no_from_url,
    safe_filename_from_basvuru_no,
    cut_decision_text,
    save_decision,
    save_log,
    TXT_DIR,
)

def main():
    if len(sys.argv) < 2:
        print("Kullanım: python tek_karar_cek.py 2014/4645")
        return

    basvuru_no = sys.argv[1].strip()
    url = f"https://kararlarbilgibankasi.anayasa.gov.tr/BB/{basvuru_no}"

    TXT_DIR.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        try:
            print("Çekiliyor:", basvuru_no)
            print("URL:", url)

            page.goto(url, wait_until="networkidle", timeout=60000)
            time.sleep(2)

            raw_text = page.locator("body").inner_text()
            text = cut_decision_text(raw_text)

            try:
                page.get_by_text("KARAR BLG FORMU", exact=True).click()
                time.sleep(1)
                bilgi_formu_text = page.locator("body").inner_text()
            except Exception:
                bilgi_formu_text = ""

            if not text:
                save_log(url, basvuru_no, "METIN_BOS", raw_text[:500])
                print("HATA: metin boş / karar başlangıcı bulunamadı")
                return

            safe_no = safe_filename_from_basvuru_no(basvuru_no)
            txt_path = TXT_DIR / f"{safe_no}.txt"
            txt_path.write_text(text, encoding="utf-8")

            save_decision(url, basvuru_no, text, bilgi_formu_text)

            print("OK")
            print("Kaydedildi:", basvuru_no)
            print("Uzunluk:", len(text))

        except Exception as e:
            save_log(url, basvuru_no, "HATA", str(e))
            print("HATA:", e)

        finally:
            browser.close()

if __name__ == "__main__":
    main()
