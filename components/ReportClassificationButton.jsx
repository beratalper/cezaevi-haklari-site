"use client";

import { useState } from "react";

export default function ReportClassificationButton({ item }) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const res = await fetch("/api/report-classification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    kararAdi: item.karar_adi,
                    basvuruNo: item.basvuru_no,
                    pageUrl: `https://cezaevihaklari.com/kararlar/${item.basvuru_no.replace("/", "-")}`,
                    message,
                }),
            });

            if (res.ok) {
                setSuccess(true);
                setMessage("");
            } else {
                alert("Gönderilemedi.");
            }
        } catch (err) {
            alert("Hata oluştu.");
        }

        setLoading(false);
    };

    return (
        <>
            {/* BUTON */}
            <button
                onClick={() => setOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 backdrop-blur-sm transition hover:bg-red-500/20 hover:border-red-500/70 cursor-pointer"
            >
                ⚠️ Yanlış sınıflandırma bildir
            </button>

            {/* POPUP */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                        {!success ? (
                            <>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Bildirim gönder
                                </h2>

                                <p className="mt-2 text-sm text-gray-600">
                                    Bu kararın cezaevi hak ihlali kapsamında olmadığını düşünüyorsanız bize bildirebilirsiniz.
                                </p>

                                <textarea
                                    placeholder="Eklemek istediğiniz not (opsiyonel)"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="mt-4 w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e]"
                                    rows={4}
                                />

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="text-sm text-gray-500 hover:text-gray-800"
                                    >
                                        İptal
                                    </button>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="rounded-lg bg-[#c9a96e] px-4 py-2 text-sm font-semibold text-black hover:bg-[#d9bd83]"
                                    >
                                        {loading ? "Gönderiliyor..." : "Gönder"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-lg font-semibold text-green-400">
                                    Teşekkürler 🙏
                                </h2>

                                <p className="mt-2 text-sm text-gray-600">
                                    Bildiriminiz alındı.
                                </p>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => {
                                            setOpen(false);
                                            setSuccess(false);
                                        }}
                                        className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
                                    >
                                        Kapat
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}