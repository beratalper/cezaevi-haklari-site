from pathlib import Path
import os
import re
from dotenv import load_dotenv
from supabase import create_client

BASE_DIR = Path(__file__).resolve().parents[1]
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY .env içinde bulunamadı.")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

SEP = " | "

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

def split_values(value):
    if not value:
        return []
    value = value.replace(" - ", ";")
    value = value.replace(" | ", ";")
    value = value.replace(",", ";")
    return [v.strip() for v in value.split(";") if v.strip()]

def normalize_piece(piece, mapping):
    key = re.sub(r"\s+", " ", piece.strip()).upper()
    return mapping.get(key, piece.strip().title())

def normalize_multi(value, mapping):
    parts = [normalize_piece(p, mapping) for p in split_values(value)]

    seen = []
    for p in parts:
        if p not in seen:
            seen.append(p)

    return SEP.join(seen)

def fetch_all():
    rows = []
    start = 0
    size = 1000

    while True:
        res = (
            supabase.table("kararlar")
            .select("id, sonuc, mudahale_iddiasi_aym, sonuc_aym, hak_ozgurluk_aym")
            .range(start, start + size - 1)
            .execute()
        )

        batch = res.data or []
        if not batch:
            break

        rows.extend(batch)
        start += size

    return rows

def chunks(items, size=500):
    for i in range(0, len(items), size):
        yield items[i:i + size]


def main():
    rows = fetch_all()
    print("Toplam kayıt:", len(rows))

    updates = []

    for row in rows:
        new_sonuc = normalize_multi(row.get("sonuc"), SONUC_MAP)
        new_mudahale = normalize_multi(row.get("mudahale_iddiasi_aym"), HAK_MAP)
        new_sonuc_aym = normalize_multi(row.get("sonuc_aym"), SONUC_MAP)
        new_hak_ozgurluk = normalize_multi(row.get("hak_ozgurluk_aym"), HAK_MAP)

        item = {"id": row["id"]}
        changed = False

        if new_sonuc and new_sonuc != row.get("sonuc"):
            item["sonuc"] = new_sonuc
            changed = True

        if new_mudahale and new_mudahale != row.get("mudahale_iddiasi_aym"):
            item["mudahale_iddiasi_aym"] = new_mudahale
            changed = True

        if new_sonuc_aym and new_sonuc_aym != row.get("sonuc_aym"):
            item["sonuc_aym"] = new_sonuc_aym
            changed = True

        if new_hak_ozgurluk and new_hak_ozgurluk != row.get("hak_ozgurluk_aym"):
            item["hak_ozgurluk_aym"] = new_hak_ozgurluk
            changed = True

        if changed:
            updates.append(item)

    print("Güncellenecek kayıt:", len(updates))

    done = 0

    for batch in chunks(updates, 500):
        supabase.table("kararlar").upsert(batch, on_conflict="id").execute()
        done += len(batch)
        print(f"Güncellendi: {done}/{len(updates)}")

    print("Bitti.")

if __name__ == "__main__":
    main()