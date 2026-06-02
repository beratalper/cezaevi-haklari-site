"use client";

import Link from "next/link";
import { useState } from "react";

export default function IctihatGruplari({ gruplar }) {
    const [acikKategori, setAcikKategori] = useState(null);

    return (
        <div className="space-y-4">
            {Object.entries(gruplar).map(([kategori, items]) => {
                const acik = acikKategori === kategori;

                return (
                    <section
                        key={kategori}
                        className="
        rounded-2xl
        border border-white/10
        bg-white/[0.03]
        transition-all duration-200
        hover:border-amber-300/30
    "
                    >
                        <button
                            type="button"
                            onClick={() => setAcikKategori(acik ? null : kategori)}
                            className="
        flex w-full items-center justify-between gap-4 p-5 text-left
        transition-all duration-200
        hover:bg-white/[0.04]
        hover:text-amber-200
        cursor-pointer
    "
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {kategori}
                                </h2>
                                <p className="mt-1 text-sm text-white/50">
                                    {items.length} içtihat rehberi
                                </p>
                            </div>

                            <span
                                className={`
        text-xl text-amber-300
        transition-transform duration-200
        ${acik ? "rotate-180" : ""}
    `}
                            >
                                ▼
                            </span>
                        </button>

                        {acik && (
                            <div className="space-y-4 border-t border-white/10 p-5">
                                {items.map((rehber) => (
                                    <Link
                                        key={rehber.slug}
                                        href={`/ictihatlar/${rehber.slug}`}
                                        className="block rounded-xl border border-white/10 bg-[#070b14] p-5 hover:border-amber-300/40 transition"
                                    >
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <span className="text-sm text-amber-300 font-semibold">
                                                {rehber.istatistik_incelenen} karar
                                            </span>

                                            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-300">
                                                {rehber.istatistik_ihlal} ihlal
                                            </span>

                                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                                                {rehber.istatistik_ihlal_yok} ihlal yok
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-semibold text-white">
                                            {rehber.baslik}
                                        </h3>

                                        <p className="mt-2 line-clamp-2 text-white/60 leading-7">
                                            {rehber.aciklama}
                                        </p>

                                        <div className="mt-4 text-sm font-semibold text-amber-300">
                                            Rehberi Aç →
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}