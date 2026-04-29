import fs from "fs/promises";
import path from "path";
import cezaeviData from "../../data/kararlar.json";

function badgeClass(sonuc = "") {
  if (sonuc.includes("İhlal Olmadığı"))
    return "border-blue-400/30 bg-blue-400/10 text-blue-300";
  if (sonuc.includes("İhlal"))
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  if (sonuc.includes("Kabul Edilemezlik"))
    return "border-slate-400/30 bg-slate-400/10 text-slate-300";
  if (sonuc.includes("Yetkisizlik"))
    return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
  if (sonuc.includes("Ret"))
    return "border-red-400/30 bg-red-400/10 text-red-300";

  return "border-slate-400/30 bg-slate-400/10 text-slate-300";
}

function konuEtiketi(konu = "") {
  const text = konu.toLowerCase();

  if (text.includes("sağlık") || text.includes("tedavi") || text.includes("hastane"))
    return "Sağlık Hakkı";
  if (text.includes("telefon")) return "Telefon Hakkı";
  if (text.includes("mektup") || text.includes("haberleşme"))
    return "Mektup ve Haberleşme";
  if (text.includes("görüş") || text.includes("ziyaret")) return "Görüş Hakkı";
  if (text.includes("disiplin")) return "Disiplin Cezası";
  if (text.includes("nakil") || text.includes("sevk")) return "Nakil";
  if (text.includes("kötü muamele") || text.includes("işkence"))
    return "Kötü Muamele Yasağı";

  return "Cezaevi Hakları";
}

function cezaeviKarariMi(item) {
  const metin = `${item.konu || ""} ${item.baslik || ""} ${
    item.hak_ozgurluk_aym || ""
  } ${item.mudahale_iddiasi_aym || ""}`.toLowerCase();

  return (
    metin.includes("ceza infaz") ||
    metin.includes("cezaevi") ||
    metin.includes("infaz kurumu") ||
    metin.includes("hükümlü") ||
    metin.includes("tutuklu") ||
    metin.includes("mahpus") ||
    metin.includes("koğuş") ||
    metin.includes("disiplin cezası") ||
    metin.includes("açık görüş") ||
    metin.includes("kapalı görüş")
  );
}

function konuAdiBul(item) {
  const konu = `${item.konu || ""}`.toLowerCase();
  const cezaevi = cezaeviKarariMi(item);

  if (cezaevi) {
    if (konu.includes("telefon")) return "telefonla görüşme hakkı";
    if (konu.includes("mektup") || konu.includes("haberleşme"))
      return "haberleşme ve mektup işlemleri";
    if (konu.includes("sağlık") || konu.includes("tedavi") || konu.includes("hastane"))
      return "sağlık hizmetine erişim";
    if (konu.includes("disiplin")) return "disiplin cezaları";
    if (konu.includes("görüş") || konu.includes("ziyaret"))
      return "aile ve ziyaret görüşleri";
    if (konu.includes("nakil") || konu.includes("sevk"))
      return "sevk ve nakil işlemleri";
    if (konu.includes("çıplak arama") || konu.includes("arama"))
      return "arama uygulamaları";
    if (konu.includes("kitap") || konu.includes("gazete") || konu.includes("süreli yayın"))
      return "yayınlara erişim";

    return "cezaevi uygulamaları";
  }

  if (konu.includes("eğitim") || konu.includes("denklik")) return "eğitim hakkı";
  if (konu.includes("mülkiyet")) return "mülkiyet hakkı";
  if (konu.includes("ifade özgürlüğü")) return "ifade özgürlüğü";
  if (konu.includes("adil yargılanma")) return "adil yargılanma hakkı";
  if (konu.includes("özel hayat")) return "özel hayata saygı hakkı";
  if (konu.includes("kişi hürriyeti") || konu.includes("kişi özgürlüğü"))
    return "kişi hürriyeti ve güvenliği hakkı";
  if (konu.includes("ayrımcılık")) return "ayrımcılık yasağı";

  return "bireysel başvuru";
}

function kabulEdilemezlikSebebi(sonuc = "") {
  if (sonuc.includes("Başvuru Yollarının Tüketilmemesi")) {
    return "Mahkeme, başvurucunun Anayasa Mahkemesine gelmeden önce kullanması gereken başvuru yollarını tüketmediği kanaatine varmıştır. Benzer başvurularda önce ilgili idari ve yargısal yolların usulüne uygun şekilde kullanılması önemlidir.";
  }

  if (sonuc.includes("Süre Aşımı")) {
    return "Mahkeme, bireysel başvurunun süresi içinde yapılmadığını değerlendirmiştir. Benzer durumlarda nihai kararın öğrenildiği tarihten itibaren başvuru süresi dikkatle takip edilmelidir.";
  }

  if (sonuc.includes("Açıkça Dayanaktan Yoksunluk")) {
    return "Mahkeme, iddiaların hak ihlali sonucuna götürecek ölçüde somutlaştırılmadığı kanaatine varmıştır. Benzer başvurularda olaylar tarih, belge ve somut etkilerle açıklanmalıdır.";
  }

  if (
    sonuc.includes("Kişi Bakımından Yetkisizlik") ||
    sonuc.includes("Konu Bakımından Yetkisizlik") ||
    sonuc.includes("Zaman Bakımından Yetkisizlik") ||
    sonuc.includes("Yetkisizlik")
  ) {
    return "Mahkeme, başvurunun kendi inceleme alanı dışında kaldığını değerlendirmiştir. Başvuru yapılmadan önce şikâyetin bireysel başvuruya konu edilebilecek bir hak alanına girip girmediği kontrol edilmelidir.";
  }

  if (sonuc.includes("Anayasal ve Kişisel Önemin Olmaması")) {
    return "Mahkeme, başvurunun anayasal ve kişisel önem şartını taşımadığı kanaatine varmıştır. Benzer başvurularda olayın başvurucu üzerindeki ciddi ve kişisel etkisi açıkça ortaya konulmalıdır.";
  }

  return "Mahkeme, başvuruyu kabul edilebilirlik şartları bakımından yeterli görmemiştir. Benzer başvurularda süre, başvuru yolları ve somut delil şartlarına dikkat edilmelidir.";
}

function ihlalGerekcesi(item) {
  const konu = `${item.konu || ""}`.toLowerCase();
  const cezaevi = cezaeviKarariMi(item);

  if (cezaevi) {
    if (konu.includes("telefon"))
      return "telefonla görüşme hakkına getirilen sınırlamanın yeterli hukuki dayanak ve güvencelerle desteklenmediği";
    if (konu.includes("kapalı görüş") && (konu.includes("dinlen") || konu.includes("kayda alın")))
      return "kapalı görüş sırasında yapılan konuşmaların dinlenip kayda alınmasının yeterli kanuni güvenceye dayanmadığı";
    if (konu.includes("mektup") || konu.includes("haberleşme"))
      return "haberleşme hakkına getirilen sınırlamanın yeterli hukuki dayanak ve gerekçeyle açıklanmadığı";
    if (konu.includes("sağlık") || konu.includes("tedavi") || konu.includes("hastane"))
      return "sağlık hizmetine erişimde yaşanan gecikme veya eksikliklerin başvurucunun haklarını ihlal ettiği";
    if (konu.includes("görüş") || konu.includes("ziyaret"))
      return "aile bireyleriyle görüşme hakkına getirilen sınırlamanın yeterli gerekçeye dayanmadığı veya ölçüsüz olduğu";
    if (konu.includes("nakil") || konu.includes("sevk"))
      return "sevk veya nakil sürecinde başvurucunun aile hayatı, sağlık durumu ya da insan onuruna uygun koşullarının yeterince gözetilmediği";
    if (konu.includes("disiplin"))
      return "verilen disiplin cezasının yeterli gerekçeye dayanmadığı veya başvurucunun haklarını ölçüsüz biçimde etkilediği";
    if (konu.includes("çıplak arama") || konu.includes("arama"))
      return "arama uygulamasının insan onuruna uygun, zorunlu ve ölçülü şekilde yürütülmediği";
    if (konu.includes("kitap") || konu.includes("gazete") || konu.includes("süreli yayın"))
      return "yayınlara erişime getirilen sınırlamanın yeterli gerekçeye dayanmadığı";

    return "ceza infaz kurumundaki uygulamanın yeterli hukuki dayanak veya gerekçeyle desteklenmediği";
  }

  if (konu.includes("eğitim") || konu.includes("denklik"))
    return "eğitim hakkını etkileyen işlemin yeterli gerekçe ve ölçülülük güvenceleriyle desteklenmediği";
  if (konu.includes("mülkiyet"))
    return "mülkiyet hakkına yapılan sınırlamanın ölçülü olmadığı";
  if (konu.includes("ifade özgürlüğü"))
    return "ifade özgürlüğüne getirilen sınırlamanın demokratik toplum gereklerine uygun olmadığı";
  if (konu.includes("adil yargılanma"))
    return "yargılama sürecinde adil yargılanma güvencelerinin yeterince sağlanmadığı";

  return "kamu makamlarının işlem veya uygulamasının başvurucunun anayasal hakkını ihlal ettiği";
}

function ihlalYokGerekcesi(item) {
  const konu = `${item.konu || ""}`.toLowerCase();
  const cezaevi = cezaeviKarariMi(item);

  if (cezaevi) {
    if (konu.includes("telefon"))
      return "telefonla görüşme hakkına getirilen sınırlamanın somut olayda kanuni dayanağa sahip olduğu ve başvurucunun haklarını ölçüsüz biçimde etkilemediği";
    if (konu.includes("mektup") || konu.includes("haberleşme"))
      return "haberleşme hakkına yönelik sınırlamanın kurum güvenliği veya disiplin gerekçeleriyle açıklanabildiği";
    if (konu.includes("sağlık") || konu.includes("tedavi") || konu.includes("hastane"))
      return "sağlık hizmetine erişim konusunda idarenin gerekli adımları attığı veya iddianın yeterli biçimde desteklenmediği";
    if (konu.includes("disiplin"))
      return "disiplin cezasının somut olayda yeterli gerekçeye dayandığı veya başvurucunun haklarını ölçüsüz biçimde sınırlamadığı";

    return "ceza infaz kurumundaki uygulamanın somut olayda anayasal hakları ihlal edecek ağırlığa ulaşmadığı";
  }

  if (konu.includes("eğitim") || konu.includes("denklik"))
    return "eğitim hakkına ilişkin işlemin somut olayda anayasal hak ihlali oluşturmadığı";
  if (konu.includes("mülkiyet"))
    return "mülkiyet hakkına yapılan sınırlamanın somut olayda ölçüsüz olmadığı";
  if (konu.includes("adil yargılanma"))
    return "yargılama sürecinin somut olayda adil yargılanma hakkını ihlal etmediği";

  return "şikâyet edilen işlem veya uygulamanın somut olayda anayasal hak ihlali oluşturmadığı";
}

function kararOzeti(item) {
  const konu = `${item.konu || ""}`.toLowerCase();
  const sonuc = item.sonuc || "";
  const cezaevi = cezaeviKarariMi(item);

  let olay = cezaevi
    ? "Başvurucu, ceza infaz kurumunda uygulanan bir işlem nedeniyle bireysel başvuruda bulunmuştur."
    : "Başvurucu, kamu makamlarının bir işlem veya uygulaması nedeniyle temel haklarının ihlal edildiğini ileri sürerek bireysel başvuruda bulunmuştur.";

  if (cezaevi) {
    if (konu.includes("disiplin")) {
      olay =
        "Başvurucu, ceza infaz kurumunda hakkında verilen disiplin cezasının haksız veya ölçüsüz olduğunu ileri sürmüştür. Başvuru, disiplin cezasının ifade özgürlüğü, savunma hakkı veya adil yargılanma güvenceleri üzerindeki etkisiyle ilgilidir.";
    } else if (
      konu.includes("duruşmada hazır bulunma") ||
      konu.includes("duruşmaya katılım") ||
      konu.includes("ses ve görüntü")
    ) {
      olay =
        "Başvurucu, duruşmada bizzat hazır bulunma talebinin reddedildiğini veya yargılamaya ses ve görüntü aktarımı yoluyla katılmasının yeterli olmadığını ileri sürmüştür. Başvuru, duruşmaya katılım biçiminin adil yargılanma hakkı bakımından yeterli olup olmadığıyla ilgilidir.";
    } else if (
      konu.includes("kapalı görüş") &&
      (konu.includes("dinlen") || konu.includes("kayda alın"))
    ) {
      olay =
        "Başvurucular, ceza infaz kurumunda kapalı görüş sırasında yaptıkları konuşmaların teknik araçlarla dinlenmesi ve kayda alınmasından şikâyet etmiştir. Başvuruculara göre bu uygulama, yakınlarıyla yaptıkları görüşmelerin gizliliğini ortadan kaldırmış ve özel hayat ile haberleşme özgürlüğüne müdahale oluşturmuştur.";
    } else if (konu.includes("telefon")) {
      olay =
        "Başvurucu, ceza infaz kurumunda telefonla görüşme hakkının engellendiğini, sınırlandırıldığını veya denetlendiğini ileri sürmüştür. Başvuru, kişinin yakınlarıyla iletişim kurma imkânına yapılan sınırlamanın hukuka uygun olup olmadığıyla ilgilidir.";
    } else if (konu.includes("mektup") || konu.includes("haberleşme")) {
      olay =
        "Başvurucu, mektup veya haberleşme sürecinde idare tarafından yapılan kısıtlama ya da denetimden şikâyet etmiştir. Başvuru, ceza infaz kurumunda haberleşmenin hangi şartlarda sınırlandırılabileceği meselesine ilişkindir.";
    } else if (konu.includes("sağlık") || konu.includes("tedavi") || konu.includes("hastane")) {
      olay =
        "Başvurucu, ceza infaz kurumunda sağlık hizmetine erişemediğini, tedavi sürecinin geciktiğini veya gerekli tıbbi desteğin sağlanmadığını ileri sürmüştür. Başvuru, kurum idaresinin sağlık hizmetleri konusundaki yükümlülüklerini yerine getirip getirmediğiyle ilgilidir.";
    } else if (konu.includes("görüş") || konu.includes("ziyaret")) {
      olay =
        "Başvurucu, yakınlarıyla görüşme veya ziyaret hakkının sınırlandırıldığını ileri sürmüştür. Başvuru, ceza infaz kurumunda aile bağlarının korunması ile kurum güvenliği arasındaki dengenin nasıl kurulacağına ilişkindir.";
    } else if (konu.includes("nakil") || konu.includes("sevk")) {
      olay =
        "Başvurucu, başka bir ceza infaz kurumuna sevk edilmesi veya nakil sürecindeki uygulamalar nedeniyle mağdur olduğunu ileri sürmüştür. Başvuru, idarenin sevk yetkisini kullanırken kişinin aile hayatı, sağlık durumu veya insan onuruna uygun koşulları gözetip gözetmediğiyle ilgilidir.";
    }
  } else {
    if (konu.includes("eğitim") || konu.includes("denklik")) {
      olay =
        "Başvurucu, eğitim hayatını veya aldığı eğitimin resmî olarak tanınmasını etkileyen bir işlem nedeniyle bireysel başvuruda bulunmuştur. Başvuru, kamu makamlarının eğitim hakkı üzerindeki etkisinin hukuka uygun olup olmadığıyla ilgilidir.";
    } else if (konu.includes("mülkiyet")) {
      olay =
        "Başvurucu, malvarlığına veya ekonomik değer taşıyan bir hakkına yönelik kamu müdahalesinden şikâyet etmiştir. Başvuru, mülkiyet hakkına yapılan sınırlamanın hukuka uygun olup olmadığıyla ilgilidir.";
    } else if (konu.includes("ifade özgürlüğü")) {
      olay =
        "Başvurucu, düşünce açıklaması veya ifade faaliyeti nedeniyle temel hakkının ihlal edildiğini ileri sürmüştür. Başvuru, ifade özgürlüğüne getirilen sınırlamanın demokratik toplumda gerekli olup olmadığıyla ilgilidir.";
    } else if (konu.includes("adil yargılanma")) {
      olay =
        "Başvurucu, yargılama sürecinde adil yargılanma hakkının ihlal edildiğini ileri sürmüştür. Başvuru, mahkeme sürecinin güvencelere uygun yürütülüp yürütülmediğiyle ilgilidir.";
    }
  }

  let aym =
    "Anayasa Mahkemesi, başvurucunun iddialarını olayın koşulları ve ilgili anayasal haklar çerçevesinde değerlendirmiştir.";

  if (sonuc.includes("İhlal") && !sonuc.includes("İhlal Olmadığı")) {
    aym = `Anayasa Mahkemesi, ${ihlalGerekcesi(item)} kanaatine vararak ihlal kararı vermiştir.`;
  } else if (sonuc.includes("İhlal Olmadığı")) {
    aym = `Anayasa Mahkemesi, ${ihlalYokGerekcesi(item)} kanaatine vararak ihlal olmadığı sonucuna ulaşmıştır.`;
  } else if (
    sonuc.includes("Kabul Edilemezlik") ||
    sonuc.includes("Açıkça Dayanaktan Yoksunluk") ||
    sonuc.includes("Başvuru Yollarının Tüketilmemesi") ||
    sonuc.includes("Süre Aşımı") ||
    sonuc.includes("Yetkisizlik") ||
    sonuc.includes("Anayasal ve Kişisel Önemin Olmaması")
  ) {
    aym = `Anayasa Mahkemesi, başvuruyu esasına girmeden kabul edilemez bulmuştur. ${kabulEdilemezlikSebebi(sonuc)}`;
  } else if (sonuc.includes("Düşme")) {
    aym =
      "Anayasa Mahkemesi, başvurunun incelenmesini sürdürmeyi gerektiren bir neden kalmadığı kanaatiyle düşme kararı vermiştir.";
  }

  return `${olay}\n\n${aym}`;
}

function nedenOnemli(item) {
  const sonuc = item.sonuc || "";
  const konuAdi = konuAdiBul(item);

  if (sonuc.includes("İhlal") && !sonuc.includes("İhlal Olmadığı")) {
    return `Bu karar, ${konuAdi} konusunda kamu makamlarının karar ve uygulamalarının Anayasa Mahkemesi tarafından denetlenebileceğini gösterir. Benzer durumlarda yalnızca genel ifadeler değil, somut olayın özelliklerine göre açık gerekçe sunulması önemlidir.`;
  }

  if (
    sonuc.includes("Kabul Edilemezlik") ||
    sonuc.includes("Açıkça Dayanaktan Yoksunluk") ||
    sonuc.includes("Başvuru Yollarının Tüketilmemesi") ||
    sonuc.includes("Süre Aşımı") ||
    sonuc.includes("Yetkisizlik")
  ) {
    return `Bu karar, ${konuAdi} konusunda Anayasa Mahkemesine başvurmadan önce usul şartlarının dikkatle yerine getirilmesi gerektiğini gösterir. Süre, başvuru yolları ve somut delil eksikliği başvurunun esasına girilmeden reddedilmesine yol açabilir.`;
  }

  if (sonuc.includes("İhlal Olmadığı")) {
    return `Bu karar, ${konuAdi} konusunda her idari veya yargısal kararın otomatik olarak hak ihlali sayılmadığını gösterir. Mahkeme, olayın koşullarını, gerekçeleri ve başvurucu üzerindeki etkiyi birlikte değerlendirir.`;
  }

  return `Bu karar, ${konuAdi} konusunda bireysel başvuru yolunda hangi noktaların dikkate alındığını göstermesi bakımından önemlidir.`;
}

function kisaAnaliz(item) {
  const sonuc = item.sonuc || "";

  if (sonuc.includes("İhlal") && !sonuc.includes("İhlal Olmadığı")) {
    return "Benzer bir başvuruda olayın ne zaman gerçekleştiği, kamu makamının hangi gerekçeyle işlem yaptığı, bu işlemin kişiyi nasıl etkilediği ve varsa itiraz sürecinde verilen kararlar açıkça gösterilmelidir. Başvuruya belge, dilekçe, ret kararı ve tarih bilgileri eklenmelidir.";
  }

  if (sonuc.includes("İhlal Olmadığı")) {
    return "Benzer olaylarda yalnızca hakka müdahale edildiğini söylemek yeterli olmayabilir. İşlemin neden ölçüsüz olduğu, gerekçenin neden yetersiz kaldığı ve başvurucu üzerinde hangi somut sonucu doğurduğu açıkça anlatılmalıdır.";
  }

  if (
    sonuc.includes("Kabul Edilemezlik") ||
    sonuc.includes("Açıkça Dayanaktan Yoksunluk") ||
    sonuc.includes("Başvuru Yollarının Tüketilmemesi") ||
    sonuc.includes("Süre Aşımı") ||
    sonuc.includes("Yetkisizlik")
  ) {
    return "Bu tür başvurularda süreler özellikle takip edilmelidir. Anayasa Mahkemesine gitmeden önce ilgili başvuru yolları kullanılmalı, verilen kararlar saklanmalı ve iddialar yalnızca genel şikâyet olarak değil, belge ve somut olaylarla desteklenerek sunulmalıdır.";
  }

  return "Benzer başvurularda olay kronolojik olarak anlatılmalı, kamu makamının işlemi ve buna karşı yapılan başvurular belgelenmeli, iddianın hangi hakka nasıl etki ettiği açıkça gösterilmelidir.";
}

function sonucKisa(sonuc = "") {
  if (sonuc.includes("İhlal Olmadığı")) return "İhlal Olmadığı";
  if (sonuc.includes("İhlal")) return "İhlal";
  if (
    sonuc.includes("Kabul Edilemezlik") ||
    sonuc.includes("Açıkça Dayanaktan Yoksunluk") ||
    sonuc.includes("Başvuru Yollarının Tüketilmemesi") ||
    sonuc.includes("Süre Aşımı") ||
    sonuc.includes("Yetkisizlik")
  )
    return "Kabul Edilemezlik";
  if (sonuc.includes("Düşme")) return "Düşme";
  if (sonuc.includes("Ret")) return "Ret";
  return sonuc ? "Diğer" : "Sonuç bilgisi yok";
}

async function kararMetniGetir(slug) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/karar-metinleri/${slug}.json`, {
      cache: "force-cache",
    });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}

async function kararHtmlGetir(slug) {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "karar-html",
      `${slug}.html`
    );

    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

export default async function KararDetay({ params }) {
  const { slug } = await params;
  const no = slug.replace("-", "/");

  let item = cezaeviData.find((x) => x.basvuru_no === no) || null;

  const metinDosyasi = await kararMetniGetir(slug);
  const kararHtml = await kararHtmlGetir(slug);

  console.log("SLUG:", slug);
  console.log("HTML VAR MI:", !!kararHtml);
  console.log("METIN VAR MI:", !!metinDosyasi);
  console.log("ITEM VAR MI:", !!item);

  if (!item) {
  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-20 text-white">
      <section className="mx-auto max-w-5xl">
        <a
          href="/kararlar"
          className="mb-10 inline-block text-sm text-slate-400 hover:text-[#d9bd83]"
        >
          ← Kararlara dön
        </a>

        <h1 className="font-serif text-5xl font-semibold">
          Karar bulunamadı
        </h1>

        <p className="mt-6 text-slate-400">
          Bu karar ceza infaz kurumlarına ilişkin seçilmiş kararlar listesinde yer almıyor.
        </p>
      </section>
    </main>
  );
}

if (metinDosyasi) {
  item = {
    ...item,
    ...metinDosyasi,
  };
}

  if (!item && !kararHtml && !metinDosyasi) {
    return (
      <main className="min-h-screen bg-[#070b14] px-6 py-20 text-white">
        <section className="mx-auto max-w-5xl">
          <a
            href="/kararlar"
            className="mb-10 inline-block text-sm text-slate-400 hover:text-[#d9bd83]"
          >
            ← Kararlara dön
          </a>

          <h1 className="font-serif text-5xl font-semibold">
            Karar bulunamadı
          </h1>

          <p className="mt-6 text-slate-400">
            Bu başvuru numarasına ait karar metni bulunamadı.
          </p>
        </section>
      </main>
    );
  }

  const kategori = konuEtiketi(item.konu || "");
  const resmiLink =
    item.link ||
    `https://kararlarbilgibankasi.anayasa.gov.tr/BB/${item.basvuru_no}`;

  const benzer = cezaeviData
    .filter(
      (x) =>
        x.basvuru_no !== item.basvuru_no &&
        konuEtiketi(x.konu || "") === kategori
    )
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />

        <div className="relative mx-auto max-w-5xl">
          <a
            href="/kararlar"
            className="mb-10 inline-block text-sm text-slate-400 hover:text-[#d9bd83]"
          >
            ← Kararlara dön
          </a>

          <div className="mb-5 inline-flex rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-4 py-2 text-sm font-semibold text-[#d9bd83]">
            {kategori}
          </div>

          <h1 className="font-serif text-4xl font-semibold leading-tight md:text-6xl">
            {item.baslik}
          </h1>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              Başvuru No: {item.basvuru_no}
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              Karar Tarihi: {item.karar_tarihi}
            </div>

            <div
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${badgeClass(
                item.sonuc
              )}`}
            >
              {sonucKisa(item.sonuc)}
            </div>
          </div>

<div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
  <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">
    Bu Karar Neden Önemli?
  </div>

  <p className="leading-8 text-slate-300">
    {nedenOnemli(item)}
  </p>
</div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">
              Başvuru Konusu
            </div>

            <p className="text-lg leading-9 text-slate-300">
              {item.konu || "Başvuru konusu bilgisi bulunamadı."}
            </p>
          </div>



<div className="mt-8 rounded-3xl border border-[#c9a96e]/20 bg-gradient-to-br from-[#c9a96e]/10 to-white/[0.03] p-8">
  <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">
    Karar Özeti
  </div>

  <p className="whitespace-pre-line text-lg leading-9 text-slate-200">
  {kararOzeti(item)}
  </p>

</div>
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#0d1320] p-8">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">
              Benzer Başvurularda Nelere Dikkat Edilmeli?
            </div>

            <p className="leading-8 text-slate-300">{kisaAnaliz(item)}</p>
          </div>
          

          {benzer.length > 0 && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
              <div className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">
                Benzer Kararlar
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {benzer.map((x) => (
                  <a
                    key={x.basvuru_no}
                    href={`/kararlar/${x.basvuru_no.replace("/", "-")}`}
                    className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#c9a96e]/50"
                  >
                    <div className="font-semibold text-white">{x.baslik}</div>
                    <div className="mt-2 text-sm text-slate-400">
                      {x.basvuru_no}
                    </div>
                    <div className="mt-3 text-xs font-semibold text-[#d9bd83]">
                      {konuEtiketi(x.konu || "")}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}