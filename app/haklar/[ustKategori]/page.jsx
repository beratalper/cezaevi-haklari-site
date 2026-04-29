import Link from "next/link";
import { notFound } from "next/navigation";
import { cezaeviHaklari, slugifyTR } from "@/data/cezaeviHaklari";

export function generateStaticParams() {
  return cezaeviHaklari.map((group) => ({
    ustKategori: group.slug,
  }));
}

const kategoriAciklamalari = {
  "haberlesme":
    "Ceza infaz kurumlarında bulunan tutuklu ve hükümlüler; mektup gönderme, mektup alma, telefonla görüşme ve dış dünya ile iletişim kurma hakkına sahiptir. Haberleşme özgürlüğü, hukuk devleti ilkesinin ve insan onurunun önemli bir parçasıdır. Bu bölümde Anayasa Mahkemesinin haberleşme hakkı kapsamında verdiği bireysel başvuru kararlarını inceleyebilirsiniz.",

  "ziyaret-aile-iliskisi":
    "Tutuklu ve hükümlülerin aile hayatına saygı hakkı kapsamında yakınlarıyla görüşebilmesi, açık ve kapalı ziyaret imkanlarından yararlanabilmesi önem taşır. Cezaevi koşulları nedeniyle getirilen sınırlamaların ölçülü olması gerekir. Bu bölümde aile hayatı ve ziyaret hakkına ilişkin AYM kararları yer almaktadır.",

  "ifade-yayin-bilgiye-erisim":
    "Cezaevinde bulunan kişiler de ifade özgürlüğü ile bilgiye erişim hakkına sahiptir. Kitap, gazete, dergi, yayın ve düşünce açıklamalarına getirilen sınırlamalar Anayasal denetime tabidir. Bu bölümde ifade özgürlüğü ve yayın hakkına ilişkin bireysel başvuru kararlarını bulabilirsiniz.",

  "saglik":
    "Ceza infaz kurumlarında bulunan kişilerin sağlık hizmetlerine zamanında ve etkili şekilde ulaşabilmesi devletin yükümlülükleri arasındadır. Tedavi, hastane sevki, ilaç erişimi ve sağlık koşullarına ilişkin uyuşmazlıklar bu başlık altında değerlendirilir. Bu bölümde sağlık hakkına ilişkin AYM kararları yer almaktadır.",

  "fiziksel-kosullar":
    "Barınma koşulları, hijyen, kalabalık oda, havalandırma, temizlik ve yaşam alanına ilişkin sorunlar insan onuru bakımından önem taşır. Cezaevi koşullarının asgari insan hakları standartlarına uygun olması gerekir. Bu bölümde fiziksel koşullara ilişkin AYM kararlarını inceleyebilirsiniz.",

  "kotu-muamele-guc-kullanimi":
    "Hiç kimse işkenceye, eziyete veya insan haysiyetiyle bağdaşmayan muameleye maruz bırakılamaz. Cezaevlerinde güç kullanımı, çıplak arama, darp iddiaları ve benzeri konular bu kapsamda değerlendirilmektedir. Bu bölümde kötü muamele yasağına ilişkin AYM kararları bulunmaktadır.",

  "disiplin-infaz-rejimi":
    "Ceza infaz kurumlarında uygulanan disiplin cezaları, hücre cezaları, iyi hal değerlendirmeleri ve infaz rejimine ilişkin işlemler hukuka uygun olmalıdır. Ölçüsüz müdahaleler temel hakları etkileyebilir. Bu bölümde disiplin ve infaz uygulamalarına ilişkin kararlar yer alır.",

  "egitim":
    "Tutuklu ve hükümlülerin eğitim hakkı tamamen ortadan kalkmaz. Açık öğretim, sınavlara katılım, kitap ve eğitim materyallerine erişim gibi konular bu kapsamda önem taşır. Bu bölümde eğitim hakkına ilişkin AYM kararlarını bulabilirsiniz.",

  "nakil-sevk":
    "Cezaevleri arasında nakil işlemleri, sevk sırasında uygulamalar ve uzak cezaevine gönderme gibi işlemler aile hayatı, savunma hakkı ve insan onuru bakımından önem taşır. Bu bölümde nakil ve sevk işlemlerine ilişkin AYM kararları yer almaktadır.",

  "aclik-grevi":
    "Açlık grevi süreçleri; yaşam hakkı, sağlık hakkı ve kamu makamlarının yükümlülükleri bakımından hassas konular arasında yer alır. Müdahale sınırları ve tıbbi tedbirler somut olaylara göre değerlendirilir. Bu bölümde açlık grevine ilişkin AYM kararları incelenebilir.",
};

export default async function UstKategoriPage({ params }) {
  const { ustKategori } = await params;

  const group = cezaeviHaklari.find((x) => x.slug === ustKategori);

  if (!group) {
    notFound();
  }

  const aciklama =
    kategoriAciklamalari[group.slug] ||
    "Bu başlık altında ceza infaz kurumlarında yaşanan hak ihlallerine ilişkin Anayasa Mahkemesi bireysel başvuru kararları yer almaktadır.";

  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-20 text-white">
      <section className="mx-auto max-w-6xl">
        <Link
          href="/haklar"
          className="mb-8 inline-block text-sm text-amber-300"
        >
          ← Haklar
        </Link>

        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
          Hak Kategorisi
        </p>

        <h1 className="max-w-5xl text-4xl font-bold leading-tight md:text-5xl">
          {group.title}
        </h1>

        <p className="mt-8 max-w-4xl text-lg leading-8 text-white/65">
          {aciklama}
        </p>

        <div className="mt-14 space-y-4">
  {group.items.map((item) => (
    <Link
      key={item}
      href={`/haklar/${group.slug}/${slugifyTR(item)}`}
      className="group flex flex-col justify-between gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-amber-300/50 hover:bg-white/[0.06] md:flex-row md:items-center"
    >
      <div className="text-2xl font-bold leading-snug text-white group-hover:text-amber-300">
        {item}
      </div>

      <div className="shrink-0 rounded-2xl bg-amber-300 px-5 py-3 text-sm font-bold text-black transition group-hover:scale-105 group-hover:bg-[#e2c17c]">
        Kararları İncele
      </div>
    </Link>
  ))}
</div>
      </section>
    </main>
  );
}