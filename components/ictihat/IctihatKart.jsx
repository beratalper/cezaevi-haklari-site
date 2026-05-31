export default function IctihatKart({
    baslik,
    aciklama,
    sonuc,
    kararlar = [],
}) {
    const renk =
        sonuc === "İhlal"
            ? "border-l-red-500"
            : "border-l-green-500";

    const yaziRengi =
        sonuc === "İhlal"
            ? "text-red-300"
            : "text-green-300";

    return (
        <div
            className={`rounded-2xl border border-white/10 border-l-4 ${renk} bg-white/[0.03] p-5`}
        >
            <div className={`${yaziRengi} font-semibold mb-3`}>
                {sonuc}
            </div>

            <h3 className="font-bold text-lg mb-2 text-white">
                {baslik}
            </h3>

            <p className="text-sm text-white/60 mb-4 leading-6">
                {aciklama}
            </p>

            <div>
                <div className="font-medium mb-2 text-white/80">
                    Destekleyen Kararlar
                </div>

                <ul className="space-y-1 text-sm">
                    {kararlar.map((karar) => (
                        <li key={karar.basvuruNo}>
                            <a
                                href={`https://kararlarbilgibankasi.anayasa.gov.tr/BB/${karar.basvuruNo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-amber-300 hover:underline"
                            >
                                {karar.ad}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}