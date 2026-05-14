"use client";

import { useEffect } from "react";

export default function AdBanner() {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-7518046066826938"
        data-ad-slot="BURAYA_SLOT_ID"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}