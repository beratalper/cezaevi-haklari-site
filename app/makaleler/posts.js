const posts = [
  {
  slug: "cezaevinde-telefon-hakki",
  title: "Cezaevinde Telefon Hakkı Nedir?",
  seoTitle:
    "Cezaevinde Telefon Hakkı Nedir? Tutuklu ve Hükümlü Telefon Görüşmesi",
  seoDescription:
    "Cezaevinde telefon hakkı nedir, kimler görüşebilir, süre ve kurallar nelerdir? Tutuklu ve hükümlülerin telefon görüşme hakkına dair rehber.",
  excerpt:
    "Tutuklu ve hükümlülerin telefonla görüşme hakkına ilişkin temel bilgiler.",
  content:
    "Ceza infaz kurumlarında bulunan hükümlü ve tutuklular, mevzuatta belirtilen şartlar dahilinde yakınlarıyla telefon görüşmesi yapabilir. Süre, sıklık ve denetim usulleri kurum türüne göre değişebilir.",
  },

  {
  slug: "acik-gorus-hakki",
  title: "Açık Görüş Hakkı Nedir?",
  seoTitle:
    "Açık Görüş Hakkı Nedir? Cezaevinde Açık Görüş Kuralları",
  seoDescription:
    "Açık görüş hakkı nedir, kimler yararlanabilir, cezaevinde açık görüş nasıl yapılır? Tutuklu ve hükümlüler için rehber.",
  },

  {
  slug: "disiplin-cezasina-itiraz",
  title: "Disiplin Cezasına Nasıl İtiraz Edilir?",
  seoTitle:
    "Disiplin Cezasına Nasıl İtiraz Edilir? Cezaevi Başvuru Rehberi",
  seoDescription:
    "Hücre cezası, ziyaret yasağı ve diğer disiplin cezalarına nasıl itiraz edilir? İnfaz hakimliği başvurusu hakkında temel bilgiler.",
  },

{
slug: "cezaevinde-mektup-hakki",
title: "Cezaevinde Mektup Hakkı Nedir?",
seoTitle: "Cezaevinde Mektup Hakkı Nedir? Tutuklu ve Hükümlü Haberleşme Hakkı",
seoDescription: "Cezaevinde mektup hakkı nedir, nasıl kullanılır, sınırları nelerdir? Mahpusların haberleşme hakkına dair rehber.",
excerpt: "Tutuklu ve hükümlülerin mektup gönderme ve alma hakkı.",
content: "Ceza infaz kurumlarında bulunan kişiler mevzuata uygun şekilde mektup gönderip alabilir.",
},

{
slug: "kapali-gorus-hakki",
title: "Kapalı Görüş Hakkı Nedir?",
seoTitle: "Kapalı Görüş Hakkı Nedir? Cezaevinde Görüş Kuralları",
seoDescription: "Kapalı görüş hakkı nedir, kimler yararlanabilir, süreleri nelerdir?",
excerpt: "Yakınlarla fiziksel temas olmadan yapılan görüşme hakkı.",
content: "Kapalı görüş belirli gün ve saatlerde kurum kurallarına göre yapılır.",
},

{
slug: "infaz-hakimligine-basvuru",
title: "İnfaz Hakimliğine Nasıl Başvurulur?",
seoTitle: "İnfaz Hakimliğine Nasıl Başvurulur? Dilekçe ve Süreç Rehberi",
seoDescription: "İnfaz hakimliğine başvuru nasıl yapılır? Cezaevi işlemlerine itiraz yolları.",
excerpt: "Cezaevi kararlarına karşı başvuru yolları.",
content: "İnfaz hakimliği, ceza infaz kurumlarına ilişkin bazı işlemleri denetler.",
},

{
slug: "cezaevinde-saglik-hakki",
title: "Cezaevinde Sağlık Hakkı Nedir?",
seoTitle: "Cezaevinde Sağlık Hakkı Nedir? Hastane ve Tedavi Süreci",
seoDescription: "Mahpusların sağlık hizmeti alma hakkı, hastane sevki ve tedavi süreci.",
excerpt: "Muayene, tedavi ve ilaç hakkı.",
content: "Cezaevinde bulunan kişilerin sağlık hizmetlerine erişimi temel hak kapsamındadır.",
},

{
slug: "avukat-gorus-hakki",
title: "Cezaevinde Avukat Görüş Hakkı",
seoTitle: "Cezaevinde Avukat Görüş Hakkı Nedir?",
seoDescription: "Tutuklu ve hükümlülerin avukatla görüşme hakkı hakkında bilgiler.",
excerpt: "Savunma hakkının önemli parçasıdır.",
content: "Mahpusların avukatlarıyla görüşme hakkı hukuki güvence altındadır.",
},

{
slug: "telefon-hakki-kac-dakika",
title: "Cezaevinde Telefon Hakkı Kaç Dakika?",
seoTitle: "Cezaevinde Telefon Hakkı Kaç Dakika? Güncel Bilgiler",
seoDescription: "Telefon hakkı süresi ne kadardır? Cezaevi telefon görüşmeleri rehberi.",
excerpt: "Telefon görüşme süresine ilişkin genel bilgiler.",
content: "Süreler kurum türüne ve mevzuata göre değişebilir.",
},

{
slug: "mahpusa-para-gonderme",
title: "Mahpusa Para Nasıl Gönderilir?",
seoTitle: "Mahpusa Para Nasıl Gönderilir? Cezaevi Para Yatırma Rehberi",
seoDescription: "Cezaevindeki kişiye para gönderme yolları ve temel bilgiler.",
excerpt: "Para yatırma süreci.",
content: "Kurum hesabı veya resmi yöntemlerle para gönderilebilir.",
},

{
slug: "cezaevi-sikayet-nereye-yapilir",
title: "Cezaevi Şikayet Nereye Yapılır?",
seoTitle: "Cezaevi Şikayet Nereye Yapılır? Başvuru Yolları",
seoDescription: "Cezaevindeki hak ihlallerinde nereye başvurulur?",
excerpt: "Şikayet mercileri hakkında bilgi.",
content: "İnfaz hakimliği, savcılık ve ilgili kurumlara başvuru mümkündür.",
},

{
slug: "bireysel-basvuru-suresi",
title: "AYM Bireysel Başvuru Süresi Nedir?",
seoTitle: "AYM Bireysel Başvuru Süresi Nedir?",
seoDescription: "Anayasa Mahkemesine bireysel başvuru süresi hakkında temel bilgiler.",
excerpt: "Süre şartı çok önemlidir.",
content: "Başvurular yasal süre içinde yapılmalıdır.",
},

{
slug: "cezaevinde-kitap-hakki",
title: "Cezaevinde Kitap Hakkı Var mı?",
seoTitle: "Cezaevinde Kitap Hakkı Var mı? Yayınlara Erişim Rehberi",
seoDescription: "Mahpusların kitap ve yayınlara erişim hakkı hakkında bilgiler.",
excerpt: "Kitap talebi ve sınırlamalar.",
content: "Kurum güvenliği çerçevesinde yayınlara erişim mümkündür.",
},

{
  slug: "cezaevinde-gazete-hakki",
  title: "Cezaevinde Gazete Hakkı Var mı?",
  seoTitle: "Cezaevinde Gazete Hakkı Var mı? Yayınlara Erişim Rehberi",
  seoDescription: "Mahpusların gazete ve süreli yayınlara erişim hakkı hakkında temel bilgiler.",
  excerpt: "Gazete ve yayın alma hakkına ilişkin rehber.",
  content: "Ceza infaz kurumlarında güvenlik kuralları çerçevesinde gazete ve süreli yayınlara erişim mümkün olabilir.",
},

{
  slug: "acik-cezaevine-gecis-sartlari",
  title: "Açık Cezaevine Geçiş Şartları Nelerdir?",
  seoTitle: "Açık Cezaevine Geçiş Şartları Nelerdir? Güncel Rehber",
  seoDescription: "Açık cezaevine geçiş şartları, süreç ve temel bilgiler.",
  excerpt: "Açık cezaevine ayrılma koşulları.",
  content: "Açık ceza infaz kurumuna geçiş, mevzuatta belirtilen şartlara göre değerlendirilir.",
},

{
  slug: "tutuklu-ziyaret-gunleri",
  title: "Tutuklu Ziyaret Günleri Nasıl Öğrenilir?",
  seoTitle: "Tutuklu Ziyaret Günleri Nasıl Öğrenilir? Cezaevi Görüş Rehberi",
  seoDescription: "Tutuklu ziyaret günleri, saatleri ve başvuru süreci hakkında bilgiler.",
  excerpt: "Ziyaret günü öğrenme yolları.",
  content: "Ziyaret günleri ilgili ceza infaz kurumunca belirlenir ve ilan edilebilir.",
},

{
  slug: "cezaevinde-disiplin-cezalari",
  title: "Cezaevinde Disiplin Cezaları Nelerdir?",
  seoTitle: "Cezaevinde Disiplin Cezaları Nelerdir? Haklar ve Süreç",
  seoDescription: "Cezaevinde verilen disiplin cezaları ve başvuru yolları hakkında rehber.",
  excerpt: "Disiplin yaptırımları hakkında bilgi.",
  content: "Disiplin cezaları kurum düzenini korumaya yönelik yaptırımlardır.",
},

{
  slug: "cezaevinde-hucre-cezasi",
  title: "Cezaevinde Hücre Cezası Nedir?",
  seoTitle: "Cezaevinde Hücre Cezası Nedir? İtiraz ve Haklar",
  seoDescription: "Hücre cezası nedir, ne kadar sürer, nasıl itiraz edilir?",
  excerpt: "Hücre cezasına dair temel bilgiler.",
  content: "Hücre cezası belirli disiplin ihlallerinde uygulanabilen yaptırımlardan biridir.",
},

{
  slug: "cezaevinde-nakil-talebi",
  title: "Cezaevinde Nakil Talebi Nasıl Yapılır?",
  seoTitle: "Cezaevinde Nakil Talebi Nasıl Yapılır? Kurum Değişikliği Rehberi",
  seoDescription: "Cezaevi nakil talebi şartları ve başvuru süreci hakkında bilgiler.",
  excerpt: "Nakil isteme yolları.",
  content: "Belirli koşullarda hükümlü veya tutuklular nakil talebinde bulunabilir.",
},

{
  slug: "mahpusun-egitim-hakki",
  title: "Mahpusun Eğitim Hakkı Var mı?",
  seoTitle: "Mahpusun Eğitim Hakkı Var mı? Cezaevinde Eğitim İmkanları",
  seoDescription: "Cezaevinde eğitim hakkı, kurslar ve öğrenim imkanları hakkında rehber.",
  excerpt: "Eğitim hakkına ilişkin bilgiler.",
  content: "Mahpusların eğitim faaliyetlerinden yararlanması belirli usullere tabidir.",
},

{
  slug: "cezaevinde-doktor-talebi",
  title: "Cezaevinde Doktor Talebi Nasıl Yapılır?",
  seoTitle: "Cezaevinde Doktor Talebi Nasıl Yapılır? Sağlık Başvurusu Rehberi",
  seoDescription: "Mahpusların doktor talebi, muayene ve sağlık başvuru süreci.",
  excerpt: "Doktor isteme süreci.",
  content: "Sağlık şikayetleri kurum yönetimine bildirilerek muayene talep edilebilir.",
},

{
  slug: "cezaevinde-ilac-hakki",
  title: "Cezaevinde İlaç Hakkı Nedir?",
  seoTitle: "Cezaevinde İlaç Hakkı Nedir? Tedavi ve İlaç Erişimi",
  seoDescription: "Cezaevinde ilaç kullanımı ve tedavi süreci hakkında bilgiler.",
  excerpt: "İlaç erişim hakkı rehberi.",
  content: "Doktor tarafından uygun görülen ilaçlara erişim sağlık hakkı kapsamındadır.",
},

{
  slug: "cezaevinde-aile-hayati-hakki",
  title: "Cezaevinde Aile Hayatına Saygı Hakkı",
  seoTitle: "Cezaevinde Aile Hayatına Saygı Hakkı Nedir?",
  seoDescription: "Mahpusların aile ilişkileri, ziyaret ve haberleşme hakları hakkında rehber.",
  excerpt: "Aile bağlarının korunmasına ilişkin bilgiler.",
  content: "Ziyaret ve haberleşme imkanları aile hayatına saygı hakkıyla bağlantılıdır.",
},
];

export default posts;