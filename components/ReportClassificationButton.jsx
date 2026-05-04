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
        className="inline-flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-400/20"
      >
        ⚠️ Yanlış sınıflandırma bildir
      </button>

      {/* POPUP */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-2xl bg-[#0b0f1a] p-6 shadow-xl">
            
            {!success ? (
              <>
                <h2 className="text-lg font-semibold text-white">
                  Bildirim gönder
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Bu kararın cezaevi hak ihlali kapsamında olmadığını düşünüyorsanız bize bildirebilirsiniz.
                </p>

                <textarea
                  placeholder="Eklemek istediğiniz not (opsiyonel)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-4 w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white outline-none"
                  rows={4}
                />

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setOpen(false)}
                    className="text-sm text-slate-400 hover:text-white"
                  >
                    İptal
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
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

                <p className="mt-2 text-sm text-slate-400">
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