import IctihatKart from "@/components/ictihat/IctihatKart";
import { sureliYayinRehberi } from "../../../data/ictihatlar/sureli-yayin";

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

                    <span className="mx-2">›</span>

                    <span>Süreli Yayın</span>
                </div>

                <h1 className="text-5xl font-bold leading-tight mb-6">
                    {sureliYayinRehberi.baslik}
                </h1>

                <p className="text-lg text-white/60 mb-10">
                    {sureliYayinRehberi.aciklama}
                </p>

                <div className="border rounded-lg p-6 mb-10 bg-white/[0.03]">

                    <h2 className="text-2xl font-semibold mb-3">
                        AYM'nin Süreli Yayın Yaklaşımı
                    </h2>

                    <p className="text-white/70 mb-4">
                        Anayasa Mahkemesi, cezaevlerinde gazete ve dergilere
                        erişimin engellenmesini ancak somut ve ilgili gerekçeler
                        bulunduğunda kabul etmektedir.
                    </p>

                    <p className="text-white/70">
                        Şiddeti teşvik eden, örgütsel koordinasyona hizmet eden
                        veya cezaevi güvenliğini somut olarak tehdit eden yayınlara
                        müdahale ise meşru görülebilmektedir.
                    </p>

                </div>

                <div className="grid grid-cols-3 gap-4 mb-10">

                    <div className="border rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold">
                            {sureliYayinRehberi.istatistikler.incelenen}
                        </div>
                        <div className="text-sm text-white/50">
                            İncelenen Karar
                        </div>
                    </div>

                    <div className="border rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">
                            {sureliYayinRehberi.istatistikler.ihlal}
                        </div>
                        <div className="text-sm text-white/50">
                            İhlal
                        </div>
                    </div>

                    <div className="border rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600">
                            {sureliYayinRehberi.istatistikler.ihlalYok}
                        </div>
                        <div className="text-sm text-white/50">
                            İhlal Yok
                        </div>
                    </div>

                </div>

                <section className="mb-10">

                    <h2 className="text-2xl font-semibold mb-4">
                        AYM Testi
                    </h2>

                    <div className="grid md:grid-cols-2 gap-3">

                        {[
                            "Yayının hangi bölümleri sakıncalı görülmüş?",
                            "Somut güvenlik riski açıklanmış mı?",
                            "Şiddet veya örgütsel faaliyet teşviki var mı?",
                            "Karar sadece toplatma kararına mı dayanıyor?",
                            "İnfaz hâkimliği gerçek bir denetim yapmış mı?",
                            "Müdahale ilgili ve yeterli gerekçeye dayanıyor mu?",
                        ].map((soru) => (
                            <div
                                key={soru}
                                className="border rounded-lg p-4 bg-white/[0.03]"
                            >
                                <span className="mr-2">☐</span>
                                {soru}
                            </div>
                        ))}

                    </div>

                </section>

                <section className="mb-10">

                    <h2 className="text-2xl font-semibold mb-4">
                        Temel İçtihat Kuralları
                    </h2>

                    <div className="grid gap-4">

                        <IctihatKart
                            sonuc="İhlal"
                            baslik="Toplatma kararı tek başına yeterli değildir"
                            aciklama="Bir yayının başka bir karar nedeniyle yasaklanmış olması, cezaevine verilmemesi için tek başına yeterli gerekçe oluşturmaz."
                            kararlar={[
                                {
                                    ad: "Kamuran Reşit Bekir",
                                    basvuruNo: "2013/3614",
                                },
                            ]}
                        />

                        <IctihatKart
                            sonuc="İhlal"
                            baslik="Örgüt liderine atıf tek başına yasaklama nedeni değildir"
                            aciklama="Yayında örgüt liderine ilişkin görüşler bulunması tek başına müdahaleyi haklı kılmaz."
                            kararlar={[
                                {
                                    ad: "Faik Özgür Erol",
                                    basvuruNo: "2013/2719",
                                },
                            ]}
                        />

                        <IctihatKart
                            sonuc="İhlal Yok"
                            baslik="Şiddeti ve örgütsel eylemleri teşvik eden yayınlar engellenebilir"
                            aciklama="Şiddeti öven veya örgütsel eylemlere çağrı yapan yayınlara müdahale meşru kabul edilebilir."
                            kararlar={[
                                {
                                    ad: "Hayrettin Öztekin",
                                    basvuruNo: "2013/4535",
                                },
                                {
                                    ad: "Kamuran Reşit Bekir (4)",
                                    basvuruNo: "2013/7644",
                                },
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
                            href="https://kararlarbilgibankasi.anayasa.gov.tr/BB/2013/3614"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block border rounded-lg p-5 hover:bg-gray-50 transition"
                        >
                            <h3 className="font-bold mb-2 text-blue-700">
                                Kamuran Reşit Bekir
                            </h3>

                            <p className="text-sm text-gray-600">
                                Toplatma kararına dayanılarak süreli yayının
                                verilmemesinin yeterli gerekçe oluşturmadığını
                                ortaya koyan temel ihlal kararıdır.
                            </p>
                        </a>

                        <a
                            href="https://kararlarbilgibankasi.anayasa.gov.tr/BB/2013/2719"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block border rounded-lg p-5 hover:bg-gray-50 transition"
                        >
                            <h3 className="font-bold mb-2 text-blue-700">
                                Faik Özgür Erol
                            </h3>

                            <p className="text-sm text-gray-600">
                                Örgüt liderine atıf yapılmasının tek başına
                                yasaklama gerekçesi olamayacağını gösterir.
                            </p>
                        </a>

                        <a
                            href="https://kararlarbilgibankasi.anayasa.gov.tr/BB/2013/4535"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block border rounded-lg p-5 hover:bg-gray-50 transition"
                        >
                            <h3 className="font-bold mb-2 text-blue-700">
                                Hayrettin Öztekin
                            </h3>

                            <p className="text-sm text-gray-600">
                                Şiddeti ve örgütsel faaliyetleri teşvik eden
                                yayınlara müdahalenin hangi şartlarda meşru
                                kabul edildiğini gösterir.
                            </p>
                        </a>

                        <a
                            href="https://kararlarbilgibankasi.anayasa.gov.tr/BB/2013/7644"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block border rounded-lg p-5 hover:bg-gray-50 transition"
                        >
                            <h3 className="font-bold mb-2 text-blue-700">
                                Kamuran Reşit Bekir (4)
                            </h3>

                            <p className="text-sm text-gray-600">
                                Ölüm orucu çağrıları ve örgütsel eylem
                                teşviki içeren yayınlara ilişkin önemli
                                ihlal olmadığı kararıdır.
                            </p>
                        </a>

                    </div>

                </section>

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

                                {sureliYayinRehberi.ihlalKararlari.map((k) => (
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

                                {sureliYayinRehberi.ihlalYokKararlari.map((k) => (
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
        </main>
    );
}