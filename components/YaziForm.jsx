"use client";

import { useState } from "react";
import TipTapEditor from "@/components/TipTapEditor";

export default function YaziForm({ yazi }) {
    const [baslik, setBaslik] = useState(yazi?.baslik || "");
    const [ozet, setOzet] = useState(yazi?.ozet || "");
    const [icerik, setIcerik] = useState(yazi?.icerik || "");
    const [kaynakMetinler, setKaynakMetinler] = useState("");
    const [loading, setLoading] = useState(false);
    const [kategori, setKategori] = useState(yazi?.kategori || "");
    const [kapakGorseli, setKapakGorseli] = useState(yazi?.kapak_gorseli || "");
    const [seoBaslik, setSeoBaslik] = useState(yazi?.seo_baslik || "");
    const [seoAciklama, setSeoAciklama] = useState(yazi?.seo_aciklama || "");
    const [ilgiliKararlar, setIlgiliKararlar] = useState(yazi?.ilgiliKararlar || "");
    const [tagler, setTagler] = useState(yazi?.tagler || "");

    async function handleGenerateAI() {
        try {
            setLoading(true);

            const response = await fetch("/api/ai-yazi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    kaynakMetinler,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setBaslik(data.baslik || "");
                setOzet(data.ozet || "");
                setKategori(data.kategori || "");
                setSeoBaslik(data.seoBaslik || "");
                setSeoAciklama(data.seoAciklama || "");
                setIcerik(data.icerik || "");
                setTagler(data.tagler || "");
            } else {
                alert("AI yazı oluşturamadı.");
            }
        } catch (error) {
            console.error(error);

            alert("Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const isEdit = !!yazi;

        const response = await fetch(
            isEdit
                ? `/api/yazilar/${yazi.id}`
                : "/api/yazilar",
            {
                method: isEdit ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    baslik,
                    ozet,
                    icerik,
                    kategori,
                    kapakGorseli,
                    seoBaslik,
                    seoAciklama,
                    ilgiliKararlar,
                    tagler,
                }),
            }
        );

        if (response.ok) {
            alert(
                isEdit
                    ? "Yazı güncellendi!"
                    : "Yazı eklendi!"
            );

            if (!isEdit) {
                setBaslik("");
                setOzet("");
                setIcerik("");
                setKategori("");
                setKapakGorseli("");
                setSeoBaslik("");
                setSeoAciklama("");
                setIlgiliKararlar("");
                setKaynakMetinler("");
                setTagler("");
            }
        } else {
            alert("Bir hata oluştu.");
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-12 space-y-8"
        >
            <div>
                <label className="mb-2 block text-sm font-semibold text-white/60">
                    Karar Metinleri
                </label>

                <textarea
                    value={kaynakMetinler}
                    onChange={(e) => setKaynakMetinler(e.target.value)}
                    rows={10}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4"
                />
            </div>

            <button
                type="button"
                onClick={handleGenerateAI}
                disabled={loading}
                className="rounded-2xl bg-white/10 px-6 py-3 font-bold text-white hover:bg-white/20 transition"
            >
                {loading ? "AI Oluşturuyor..." : "AI ile Yazı Oluştur"}
            </button>
            <div>
                <label className="mb-2 block text-sm font-semibold text-white/60">
                    Başlık
                </label>

                <input
                    value={baslik}
                    onChange={(e) => setBaslik(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-white/60">
                    Özet
                </label>

                <textarea
                    value={ozet}
                    onChange={(e) => setOzet(e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4"
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-semibold text-white/60">
                    Kategori
                </label>

                <input
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-white/60">
                    Tagler (virgülle ayır)
                </label>

                <input
                    value={tagler}
                    onChange={(e) => setTagler(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4"
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-semibold text-white/60">
                    SEO Başlığı
                </label>

                <input
                    value={seoBaslik}
                    onChange={(e) => setSeoBaslik(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm font-semibold text-white/60">
                    SEO Açıklaması
                </label>

                <textarea
                    value={seoAciklama}
                    onChange={(e) => setSeoAciklama(e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4"
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-semibold text-white/60">
                    İlgili Kararlar (başvuru numarası, virgülle ayır)
                </label>

                <input
                    value={ilgiliKararlar}
                    onChange={(e) => setIlgiliKararlar(e.target.value)}
                    placeholder="2020/12345, 2021/67890"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4"
                />
            </div>
            <div>
                <label className="mb-2 block text-sm font-semibold text-white/60">
                    İçerik
                </label>

                <TipTapEditor
                    content={icerik}
                    onChange={setIcerik}
                />
            </div>
            <button
                type="submit"
                className="rounded-2xl bg-amber-300 px-6 py-3 font-bold text-black"
            >
                Kaydet
            </button>
        </form>
    );
}