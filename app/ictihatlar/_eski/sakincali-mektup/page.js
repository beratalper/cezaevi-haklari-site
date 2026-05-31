import IctihatKart from "@/components/ictihat/IctihatKart";
import { sakincaliMektupRehberi } from "@/data/ictihatlar/sakincali-mektup";

export default function Page() {
    return (
        <main className="min-h-screen bg-[#070b14] text-white px-6 py-20">
            <div className="mx-auto max-w-5xl">

                <div className="mb-6 text-sm text-white/50">
                    <a
                        href="/ictihatlar"
                        className="hover:text-amber-300 transition"
                    >
                        İçtihat Rehberleri
                    </a>

                    <span className="mx-2"></span>

                    <span>{sakincaliMektupRehberi.baslik}</span>
                </div>

                <h1 className="text-5xl font-bold leading-tight mb-6">
                    {sakincaliMektupRehberi.baslik}
                </h1>

                <p className="text-lg text-white/60 mb-10">
                    {sakincaliMektupRehberi.aciklama}
                </p>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-10">
                    <h2 className="text-2xl font-semibold mb-3">
                        AYM'nin Sakıncalı Mektup Yaklaşımı
                    </h2>

                    <p className="text-white/70 mb-4">
                        {sakincaliMektupRehberi.ihlalAciklama}
                    </p>

                    <p className="text-white/70">
                        Buna karşılık mektup örgütsel haberleşme, şiddet çağrısı
                        veya örgütsel koordinasyon niteliği taşıyorsa müdahale
                        hukuka uygun kabul edilebilir.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-10">

                    <div className="border rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold">
                            {sakincaliMektupRehberi.istatistikler.incelenen}
                        </div>
                        <div className="text-sm text-gray-500">
                            İncelenen Karar
                        </div>
                    </div>

                    <div className="border rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">
                            {sakincaliMektupRehberi.istatistikler.ihlal}
                        </div>
                        <div className="text-sm text-gray-500">
                            İhlal
                        </div>
                    </div>

                    <div className="border rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">
                            {sakincaliMektupRehberi.istatistikler.ihlalYok}
                        </div>
                        <div className="text-sm text-gray-500">
                            İhlal Yok
                        </div>
                    </div>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-10">
                    <h2 className="text-2xl font-semibold mb-3">
                        Bu rehber nasıl oluşturuldu?
                    </h2>

                    <p className="text-white/70">
                        Bu rehber, sakıncalı mektup kategorisindeki yaklaşık 20
                        Anayasa Mahkemesi kararının tek tek incelenmesiyle
                        oluşturulmuştur.
                    </p>

                    <p className="mt-3 text-white/70">
                        Amaç kararları özetlemek değil, Anayasa Mahkemesinin
                        hangi durumlarda ihlal, hangi durumlarda ihlal olmadığı
                        sonucuna ulaştığını ortaya koymaktır.
                    </p>

                </div>

                {/* Hızlı Sonuç */}

                <section className="mb-10">

                    <h2 className="text-2xl font-semibold mb-4">
                        Hızlı Sonuç
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">

                        <div className="border rounded-lg p-5">
                            <h3 className="font-bold mb-3">
                                AYM'nin En Sık İhlal Bulduğu Durumlar
                            </h3>

                            <ul className="list-disc pl-5 space-y-2">
                                <li>Soyut gerekçe kullanılması</li>
                                <li>Somut risk gösterilmemesi</li>
                                <li>Mektubun içeriğinin incelenmemesi</li>
                                <li>Tüm mektubun alıkonulması</li>
                                <li>Şablon mahkeme kararları</li>
                            </ul>
                        </div>

                        <div className="border rounded-lg p-5">
                            <h3 className="font-bold mb-3">
                                AYM'nin Genellikle Kabul Ettiği Müdahaleler
                            </h3>

                            <ul className="list-disc pl-5 space-y-2">
                                <li>Örgütsel haberleşme</li>
                                <li>Örgütsel koordinasyon</li>
                                <li>Şiddet çağrısı</li>
                                <li>Örgütsel aidiyetin sürdürülmesi</li>
                                <li>Örgütsel talimat içerikleri</li>
                            </ul>
                        </div>

                    </div>

                </section>

                {/* Test */}

                <section className="mb-10">

                    <h2 className="text-2xl font-semibold mb-4">
                        AYM Testi
                    </h2>

                    <div className="border rounded-lg p-5">

                        <div className="grid md:grid-cols-2 gap-3">
                            {[
                                "İdare somut gerekçe göstermiş mi?",
                                "Sakıncalı bölümler açıkça gösterilmiş mi?",
                                "Risk somut olarak ortaya konulmuş mu?",
                                "Örgütsel haberleşme veya koordinasyon var mı?",
                                "Sakıncalı kısımlar ayrıştırılabilir mi?",
                                "Daha hafif müdahale mümkün mü?",
                            ].map((soru) => (
                                <div
                                    key={soru}
                                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-white/80"
                                >
                                    <span className="mr-2">☐</span>
                                    {soru}
                                </div>
                            ))}
                        </div>

                    </div>

                </section>

                {/* Kurallar */}

                <section className="mb-10">

                    <h2 className="text-2xl font-semibold mb-4">
                        Temel İçtihat Kuralları
                    </h2>

                    <div className="grid gap-4">

                        <IctihatKart
                            sonuc="İhlal"
                            baslik="Soyut gerekçe yeterli değildir"
                            aciklama="Mektubun neden sakıncalı olduğu somut olarak açıklanmalıdır."
                            kararlar={[
                                { ad: "Ramazan Vural", basvuruNo: "2013/1148" },
                                { ad: "Ertuğrul Akın", basvuruNo: "2017/38027" },
                                { ad: "Eşref Kaya", basvuruNo: "2019/31265" },
                            ]}
                        />

                        <IctihatKart
                            sonuc="İhlal"
                            baslik="Ayıklanabilir içerik nedeniyle tüm mektup alıkonulamaz"
                            aciklama="Sadece sakıncalı kısımlar varsa geri kalan bölüm teslim edilmelidir."
                            kararlar={[
                                { ad: "Ertuğrul Akın", basvuruNo: "2017/38027" },
                                { ad: "Hasan Umut Özer", basvuruNo: "2019/231" },
                            ]}
                        />

                        <IctihatKart
                            sonuc="İhlal Yok"
                            baslik="Örgütsel haberleşme engellenebilir"
                            aciklama="Örgütsel koordinasyon ve haberleşme amacı taşıyan mektuplara müdahale edilebilir."
                            kararlar={[
                                { ad: "Ahmet Temiz (3)", basvuruNo: "2013/3594" },
                                { ad: "Veysel Kaplan (7)", basvuruNo: "2015/6863" },
                            ]}
                        />

                    </div>

                </section>

                <section className="mb-10">

                    <h2 className="text-2xl font-semibold mb-4">
                        Mutlaka Bilinmesi Gereken Kararlar
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">

                        <a
                            href="https://kararlarbilgibankasi.anayasa.gov.tr/BB/2013/1148"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block border rounded-lg p-5 hover:bg-gray-50 transition"
                        >
                            <h3 className="font-bold mb-2 text-blue-700">
                                Ramazan Vural
                            </h3>

                            <p className="text-sm text-gray-600">
                                Soyut gerekçeyle mektubun alıkonulamayacağını gösteren
                                temel ihlal kararlarından biridir.
                            </p>
                        </a>

                        <a
                            href="https://kararlarbilgibankasi.anayasa.gov.tr/BB/2017/38027"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block border rounded-lg p-5 hover:bg-gray-50 transition"
                        >
                            <h3 className="font-bold mb-2 text-blue-700">
                                Ertuğrul Akın
                            </h3>

                            <p className="text-sm text-gray-600">
                                Sakıncalı kısımlar ayrıştırılabiliyorsa mektubun
                                tamamının alıkonulamayacağını gösterir.
                            </p>
                        </a>

                        <a
                            href="https://kararlarbilgibankasi.anayasa.gov.tr/BB/2013/3594"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block border rounded-lg p-5 hover:bg-gray-50 transition"
                        >
                            <h3 className="font-bold mb-2 text-blue-700">
                                Ahmet Temiz (3)
                            </h3>

                            <p className="text-sm text-gray-600">
                                Örgütsel haberleşme ve örgütsel irtibatın
                                sürdürülmesi hâlinde müdahalenin meşru
                                görülebileceğini gösterir.
                            </p>
                        </a>

                        <a
                            href="https://kararlarbilgibankasi.anayasa.gov.tr/BB/2013/1201"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block border rounded-lg p-5 hover:bg-gray-50 transition"
                        >
                            <h3 className="font-bold mb-2 text-blue-700">
                                Özkan Kart (2)
                            </h3>

                            <p className="text-sm text-gray-600">
                                Örgütsel içerik ve ölçülülük değerlendirmesinin
                                sınırlarını gösteren önemli kararlardandır.
                            </p>
                        </a>

                    </div>

                </section>

                {/* Kararlar */}

                <section>

                    <h2 className="text-2xl font-semibold mb-4">
                        Destekleyen Kararlar
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">

                        <div>
                            <h3 className="font-bold mb-3">
                                İhlal Kararları
                            </h3>

                            <ul className="space-y-2">
                                {sakincaliMektupRehberi.ihlalKararlari.map((k) => (
                                    <li key={k.basvuruNo}>
                                        <a
                                            href={`https://kararlarbilgibankasi.anayasa.gov.tr/BB/${k.basvuruNo}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-700 hover:underline"
                                        >
                                            {k.ad}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold mb-3">
                                İhlal Olmadığı Kararlar
                            </h3>

                            <ul className="space-y-2">
                                {sakincaliMektupRehberi.ihlalYokKararlari.map((k) => (
                                    <li key={k.basvuruNo}>
                                        <a
                                            href={`https://kararlarbilgibankasi.anayasa.gov.tr/BB/${k.basvuruNo}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-700 hover:underline"
                                        >
                                            {k.ad}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>

                </section>
            </div>
        </main >
    );
}