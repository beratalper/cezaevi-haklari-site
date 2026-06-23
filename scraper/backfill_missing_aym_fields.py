from scraper import (
    supabase,
    clean_spaces,
    html_to_text,
    infer_sonuc_from_text,
    infer_hak_from_api,
    infer_hak_from_text,
    fetch_decision_detail,
    post_search_api,
)

KBB_BASE_URL = "https://kararlarbilgibankasi.anayasa.gov.tr"


def find_karar_id_by_basvuru_no(basvuru_no):
    payloads = [
        {
            "kararTipi": "BireyselBasvuru",
            "basvuruNo": basvuru_no,
            "page": 1,
            "size": 10,
        },
        {
            "kararTipi": "BireyselBasvuru",
            "keyword": basvuru_no,
            "page": 1,
            "size": 10,
        },
        {
            "kararTipi": "BireyselBasvuru",
            "searchText": basvuru_no,
            "page": 1,
            "size": 10,
        },
    ]

    for payload in payloads:
        try:
            data = post_search_api(payload)
            for karar in data.get("data", []):
                if clean_spaces(karar.get("basvuruNo")) == basvuru_no:
                    return karar.get("id")
        except Exception as e:
            print("Arama hatası:", basvuru_no, e)

    return None


def main():
    result = (
        supabase
        .table("kararlar")
        .select("id, basvuru_no, karar_adi, metin, sonuc_aym, hak_ozgurluk_aym, aym_url")
        .or_("sonuc_aym.is.null,hak_ozgurluk_aym.is.null,aym_url.is.null")
        .execute()
    )

    rows = result.data or []
    print("Eksik kayıt:", len(rows))

    updated = 0
    failed = 0

    for row in rows:
        db_id = row["id"]
        basvuru_no = row["basvuru_no"]

        print("\nİşleniyor:", basvuru_no)

        karar_id = find_karar_id_by_basvuru_no(basvuru_no)

        detay = None
        text = row.get("metin") or ""

        if karar_id:
            detay = fetch_decision_detail(karar_id)
            if detay and detay.get("icerik"):
                text = html_to_text(detay.get("icerik"), separator="\n")

        if not text:
            print("  -> metin yok, geçildi")
            failed += 1
            continue

        sonuc_aym = infer_sonuc_from_text(text)

        hak_ozgurluk_aym = ""
        if detay:
            hak_ozgurluk_aym = infer_hak_from_api(detay.get("bireyselAnayasaHukum"))

        if not hak_ozgurluk_aym:
            hak_ozgurluk_aym = infer_hak_from_text(text)

        update_data = {
            "sonuc_aym": sonuc_aym or None,
            "hak_ozgurluk_aym": hak_ozgurluk_aym or None,
            "aym_url": f"{KBB_BASE_URL}/BB/{basvuru_no}",
        }

        if text:
            update_data["metin"] = text

        supabase.table("kararlar").update(update_data).eq("id", db_id).execute()

        updated += 1
        print("  -> güncellendi")
        print("     sonuc_aym:", update_data["sonuc_aym"])
        print("     hak_ozgurluk_aym:", update_data["hak_ozgurluk_aym"])
        print("     aym_url:", update_data["aym_url"])

    print("\nBitti")
    print("Güncellenen:", updated)
    print("Başarısız:", failed)


if __name__ == "__main__":
    main()