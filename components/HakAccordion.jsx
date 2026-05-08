"use client";

import { useState } from "react";
import Link from "next/link";

export default function HakAccordion({ hakGruplari }) {

    return (
        <div className="mt-14 grid gap-6 md:grid-cols-2">
            {hakGruplari.map((group) => (
                <div
                    key={group.slug}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 shadow-2xl transition-all duration-300 hover:border-amber-300/40 hover:bg-white/[0.05]"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold leading-snug text-amber-300">
                                {group.title}
                            </h2>

                            <p className="mt-4 text-base leading-7 text-white/75">
                                {group.description}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <div className="rounded-full border border-white/10 bg-[#2a2412] px-5 py-3 text-sm font-bold text-amber-300">
                            {group.toplam} Karar
                        </div>

                        <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm font-bold text-emerald-300">
                            %{group.oran} İhlal
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <Link
                            href={`/konular/${group.slug}`}
                            className="inline-flex rounded-2xl bg-amber-300 px-5 py-3 text-sm font-bold text-black transition-all duration-300 hover:scale-105 hover:bg-[#e2c17c]"
                        >
                            Kararları İncele →
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}