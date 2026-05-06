"use client";

import { useEffect, useState } from "react";

export default function InfoModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("infoModalClosed")) {
      setShow(true);
    }
  }, []);

  function closeModal() {
    localStorage.setItem("infoModalClosed", "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4">
      <div className="relative w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b1020] p-8 text-white shadow-2xl">
        <button
          onClick={closeModal}
          className="absolute right-5 top-4 text-3xl text-white/60 hover:text-white"
        >
          ×
        </button>

        <h2 className="text-3xl font-semibold text-[#d9bd83]">
          Bilgilendirme
        </h2>

        <p className="mt-5 leading-8 text-slate-300">
          Bireysel başvurunuzu, 
        </p>
        <p className="mt-5 leading-8 text-slate-300">
           * başvuru yollarının tüketildiği tarihten;
        </p>
        <p className="mt-5 leading-8 text-slate-300">
           * başvuru yolu öngörülmemişse ihlalin öğrenildiği tarihten itibaren
        </p>
        <p className="mt-5 leading-8 text-slate-300">
           !!! OTUZ GÜN İÇİNDE YAPMAYI UNUTMAYIN !!! 
        </p>

        <p className="mt-5 leading-8 text-slate-300">
           (Haklı bir mazereti nedeniyle süresi içinde başvuramayanlar, mazeretin kalktığı tarihten itibaren onbeş gün içinde ve mazeretlerini belgeleyen delillerle birlikte başvurabilirler.)
        </p>

        <button
          onClick={closeModal}
          className="mt-8 rounded-2xl bg-amber-300 px-6 py-3 font-bold text-black hover:bg-[#e2c17c]"
        >
          Anladım
        </button>
      </div>
    </div>
  );
}