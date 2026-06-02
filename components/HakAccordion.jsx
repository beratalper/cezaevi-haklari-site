"use client";

import { useState } from "react";
import Link from "next/link";

export default function HakAccordion({ hakGruplari }) {
    const [acikKategori, setAcikKategori] = useState(null);

    return (
        <div className="mt-14 space-y-5">
            {hakGruplari.map((group) => {
                const acik = acikKategori === group.title;

                return (
                    <section
                        key={group.title}
                        className="rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl transition-all duration-300 hover:border-amber-300/40 hover:bg-white/[0.05]"
                    >
                        <button
                            type="button"
                            onClick={() =>
                                setAcikKategori(acik ? null : group.title)
                            }
                            className="flex w-full cursor-pointer items-center justify-between gap-5 p-7 text-left"
                        >
                            <div>
                                <h2 className="text-2xl font-bold leading-snug text-amber-300">
                                    {group.title}
                                </h2>

                                <div className="mt-4 flex flex-wrap gap-3">
                                    <div className="rounded-full border border-white/10 bg-[#2a2412] px-4 py-2 text-sm font-bold text-amber-300">
                                        {group.toplam} karar
                                    </div>

                                    <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
                                        %{group.oran} ihlal
                                    </div>

                                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/60">
                                        {group.items?.length || 0} alt rehber
                                    </div>
                                </div>
                            </div>

                            <span
                                className={`text-2xl text-amber-300 transition-transform duration-300 ${
                                    acik ? "rotate-180" : ""
                                }`}
                            >
                                ▼
                            </span>
                        </button>

                        {acik && (
                            <div className="space-y-4 border-t border-white/10 p-7 pt-5">
                                {group.items?.map((item) => (
                                    <Link
                                        key={item.slug}
                                        href={`/ictihatlar/${item.slug}`}
                                        className="block rounded-2xl border border-white/10 bg-[#070b14] p-5 transition-all duration-300 hover:border-amber-300/40 hover:bg-white/[0.04]"
                                    >
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-white">
                                                    {item.title}
                                                </h3>

                                                {item.description && (
                                                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">
                                                        {item.description}
                                                    </p>
                                                )}

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-300">
                                                        {item.karar_sayisi} karar
                                                    </span>

                                                    <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                                                        {item.ihlal_sayisi} ihlal
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="shrink-0 rounded-2xl bg-amber-300 px-4 py-3 text-sm font-bold text-black transition group-hover:bg-[#e2c17c]">
                                                Rehberi Aç →
                                            </div>
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