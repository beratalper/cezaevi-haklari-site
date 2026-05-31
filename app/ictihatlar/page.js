import Link from "next/link";

const rehberler = [
    {
        baslik: "Sakıncalı Mektup AYM Testi",
        aciklama:
            "Ceza infaz kurumlarında mektupların sakıncalı bulunarak alıkonulmasına ilişkin içtihat rehberi.",
        href: "/ictihatlar/sakincali-mektup",
        kararSayisi: "20+ karar",
    },
    {
        baslik: "Süreli Yayın AYM Testi",
        aciklama:
            "Gazete ve dergi gibi süreli yayınlara erişimin engellenmesine ilişkin içtihat rehberi.",
        href: "/ictihatlar/sureli-yayin",
        kararSayisi: "50+ karar",
    },
];

export default function Page() {
    return (
        <main className="min-h-screen bg-[#070b14] text-white px-6 py-20">
            <div className="mx-auto max-w-5xl">

                <h1 className="text-5xl font-bold leading-tight mb-6">
                    AYM Cezaevi İçtihat Rehberleri
                </h1>

                <p className="text-lg text-white/60 mb-10">
                    Anayasa Mahkemesinin ceza infaz kurumu kararlarından
                    çıkarılan pratik içtihat testleri ve temel kurallar.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                    {rehberler.map((rehber) => (
                        <Link
                            key={rehber.href}
                            href={rehber.href}
                            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-amber-300/40 transition"
                        >
                            <div className="text-sm text-amber-300 font-semibold mb-2">
                                {rehber.kararSayisi}
                            </div>

                            <h2 className="text-2xl font-semibold mb-3 text-white">
                                {rehber.baslik}
                            </h2>

                            <p className="text-white/60 leading-7">
                                {rehber.aciklama}
                            </p>

                            <div className="mt-5 text-sm font-semibold text-amber-300">
                                Rehberi Aç →
                            </div>
                        </Link>
                    ))}
                </div>

                <section className="mt-16">

                    <h2 className="text-3xl font-bold mb-6">
                        Yakında Eklenecek Rehberler
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/70">
                            📚 Kitap Yasakları
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/70">
                            📞 Telefon Görüşmeleri
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/70">
                            👥 Açık ve Kapalı Görüş
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white/70">
                            ⚖️ Disiplin Cezaları
                        </div>

                    </div>

                </section>

            </div>
        </main>
    );
}