"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent");

    if (!accepted) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[95%] max-w-3xl -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0b1120]/95 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-semibold text-amber-300">
            Çerez Kullanımı
          </div>

          <p className="mt-2 text-sm leading-7 text-slate-300">
            Bu site kullanıcı deneyimini geliştirmek, analiz yapmak ve reklam
            hizmetleri sunmak amacıyla çerezler kullanmaktadır.
          </p>
        </div>

        <button
          onClick={acceptCookies}
          className="rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-black transition hover:bg-[#e2c17c]"
        >
          Kabul Et
        </button>
      </div>
    </div>
  );
}