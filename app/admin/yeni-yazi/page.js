"use client";

import { useState } from "react";
import TipTapEditor from "@/components/TipTapEditor";

export default function YeniYaziPage() {
    const [baslik, setBaslik] = useState("");
    const [ozet, setOzet] = useState("");
    const [icerik, setIcerik] = useState("");
    const [kaynakMetinler, setKaynakMetinler] = useState("");
    const [loading, setLoading] = useState(false);
    const [kategori, setKategori] = useState("");
    const [kapakGorseli, setKapakGorseli] = useState("");
    const [seoBaslik, setSeoBaslik] = useState("");
    const [seoAciklama, setSeoAciklama] = useState("");
    const [ilgiliKararlar, setIlgiliKararlar] = useState("");

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

        const response = await fetch("/api/yazilar", {
            method: "POST",
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
            }),
        });

        if (response.ok) {
            alert("Yazı eklendi!");

            setBaslik("");
            setOzet("");
            setIcerik("");
            setKategori("");
            setKapakGorseli("");
            setSeoBaslik("");
            setSeoAciklama("");
            setIlgiliKararlar("");
            setKaynakMetinler("");
        } else {
            alert("Hata oluştu.");
        }
    }

    return (
        <main className="min-h-screen bg-[#070b14] text-white px-6 py-20">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-4xl font-bold mb-10">
                    Yeni Yazı
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="text"
                        placeholder="Başlık"
                        value={baslik}
                        onChange={(e) => setBaslik(e.target.value)}
                        className="w-full rounded-2xl bg-white/5 border border-white/10 p-4"
                    />

                    <textarea
                        placeholder="Özet"
                        value={ozet}
                        onChange={(e) => setOzet(e.target.value)}
                        rows={4}
                        className="w-full rounded-2xl bg-white/5 border border-white/10 p-4"
                    />

                    <input
                        type="text"
                        placeholder="Kategori"
                        value={kategori}
                        onChange={(e) => setKategori(e.target.value)}
                        className="w-full rounded-2xl bg-white/5 border border-white/10 p-4"
                    />

                    <input
                        type="text"
                        placeholder="Kapak görseli URL"
                        value={kapakGorseli}
                        onChange={(e) => setKapakGorseli(e.target.value)}
                        className="w-full rounded-2xl bg-white/5 border border-white/10 p-4"
                    />

                    <input
                        type="text"
                        placeholder="SEO Başlığı"
                        value={seoBaslik}
                        onChange={(e) => setSeoBaslik(e.target.value)}
                        className="w-full rounded-2xl bg-white/5 border border-white/10 p-4"
                    />

                    <textarea
                        placeholder="SEO Açıklaması"
                        value={seoAciklama}
                        onChange={(e) => setSeoAciklama(e.target.value)}
                        rows={3}
                        className="w-full rounded-2xl bg-white/5 border border-white/10 p-4"
                    />

                    <textarea
                        placeholder="İlgili karar numaraları (her satıra bir tane)"
                        value={ilgiliKararlar}
                        onChange={(e) => setIlgiliKararlar(e.target.value)}
                        rows={4}
                        className="w-full rounded-2xl bg-white/5 border border-white/10 p-4"
                    />

                    <textarea
                        placeholder="Kararlardan ilgili pasajları buraya yapıştır..."
                        value={kaynakMetinler}
                        onChange={(e) => setKaynakMetinler(e.target.value)}
                        rows={10}
                        className="w-full rounded-2xl bg-white/5 border border-white/10 p-4"
                    />

                    <button
                        type="button"
                        onClick={handleGenerateAI}
                        disabled={loading}
                        className="rounded-2xl bg-amber-300 px-6 py-4 font-bold text-black"
                    >
                        {loading ? "Üretiliyor..." : "AI ile Taslak Oluştur"}
                    </button>

                    <TipTapEditor
                        content={icerik}
                        onChange={setIcerik}
                    />

                    <button
                        type="submit"
                        className="rounded-2xl bg-amber-300 px-6 py-4 font-bold text-black"
                    >
                        Yayınla
                    </button>
                </form>
            </div>
        </main>
    );
}