import "dotenv/config";
import axios from "axios";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LIMIT = 1000;

function clean(text = "") {
    return text.replace(/\s+/g, " ").trim();
}
function parseIncelemeSonuclari(html) {
    const $ = cheerio.load(html);
    const sonuc = [];

    $("table").each((i, table) => {
        const rows = [];

        $(table).find("tr").each((ri, tr) => {
            const cells = [];

            $(tr).find("th,td").each((ci, cell) => {
                cells.push(clean($(cell).text()));
            });

            if (cells.length) rows.push(cells);
        });

        if (!rows.length) return;

        const header = rows[0].join(" | ").toLowerCase();

        const uygunMu =
            header.includes("hak") &&
            header.includes("müdahale") &&
            header.includes("sonuç");

        if (!uygunMu) return;

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];

            sonuc.push({
                hak_ozgurluk_aym: row[0] || null,
                mudahale_iddiasi_aym: row[1] || null,
                sonuc_aym: row[2] || null,
                giderim_aym: row[3] || null,
            });
        }
    });

    return sonuc;
}

function rowsToSummary(rows) {
    const uniqJoin = (values) => {
        const temiz = values.map((v) => clean(v || "")).filter(Boolean);
        return [...new Set(temiz)].join("; ") || null;
    };

    return {
        hak_ozgurluk_aym: uniqJoin(rows.map((r) => r.hak_ozgurluk_aym)),
        mudahale_iddiasi_aym: uniqJoin(rows.map((r) => r.mudahale_iddiasi_aym)),
        sonuc_aym: uniqJoin(rows.map((r) => r.sonuc_aym)),
        giderim_aym: uniqJoin(rows.map((r) => r.giderim_aym)),
    };
}

async function fetchKararHtml(basvuruNo) {
    const url = `https://kararlarbilgibankasi.anayasa.gov.tr/BB/${basvuruNo}`;

    const { data } = await axios.get(url, {
        timeout: 30000,
        headers: {
            "User-Agent": "Mozilla/5.0",
        },
    });

    return data;
}

async function main() {
    const { data: kararlar, error } = await supabase
        .from("kararlar")
        .select("id, basvuru_no, karar_adi")
        .or(
            "hak_ozgurluk_aym.is.null,hak_ozgurluk_aym.eq.,mudahale_iddiasi_aym.is.null,mudahale_iddiasi_aym.eq.,sonuc_aym.is.null,sonuc_aym.eq."
        )
        .order("id", { ascending: true })
        .limit(LIMIT);

    if (error) throw error;

    console.log(`İşlenecek kayıt sayısı: ${kararlar.length}`);
    let successCount = 0;
    let failCount = 0;

    for (const karar of kararlar) {
        console.log("\n-----------------------------");
        console.log(`${karar.id} | ${karar.basvuru_no} | ${karar.karar_adi}`);

        const html = await fetchKararHtml(karar.basvuru_no);
        const rows = parseIncelemeSonuclari(html);
        const summary = rowsToSummary(rows);

        console.log("Satırlar:");
        console.dir(rows, { depth: null });

        console.log("Özet:");
        console.dir(summary, { depth: null });

        /* ---------------------------------- */
        /* ilişkili tabloyu temizle */
        /* ---------------------------------- */

        const { error: deleteError } = await supabase
            .from("karar_inceleme_sonuclari")
            .delete()
            .eq("karar_id", karar.id);

        if (deleteError) {
            console.error("DELETE ERROR:", deleteError);
            failCount++;
            continue;
        }

        /* ---------------------------------- */
        /* satırları ekle */
        /* ---------------------------------- */

        if (rows.length > 0) {
            const insertPayload = rows.map((r) => ({
                karar_id: karar.id,
                hak_ozgurluk_aym: r.hak_ozgurluk_aym,
                mudahale_iddiasi_aym: r.mudahale_iddiasi_aym,
                sonuc_aym: r.sonuc_aym,
                giderim_aym: r.giderim_aym,
            }));

            const { error: insertError } = await supabase
                .from("karar_inceleme_sonuclari")
                .insert(insertPayload);

            if (insertError) {
                console.error("INSERT ERROR:", insertError);
                failCount++;
                continue;
            }
        }

        /* ---------------------------------- */
        /* ana tabloyu güncelle */
        /* ---------------------------------- */

        const { error: updateError } = await supabase
            .from("kararlar")
            .update(summary)
            .eq("id", karar.id);

        if (updateError) {
            console.error("UPDATE ERROR:", updateError);
            failCount++;
            continue;
        }

        console.log("✓ DB güncellendi");
        successCount++;

        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.log("\n======================");
    console.log("İŞLEM TAMAMLANDI");
    console.log("======================");
    console.log("Başarılı:", successCount);
    console.log("Hatalı:", failCount);
    console.log("Toplam:", kararlar.length);
}

main().catch((err) => {
    console.error("GENEL HATA:", err);
    process.exit(1);
});