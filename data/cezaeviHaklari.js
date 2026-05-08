export const cezaeviHaklari = [
  {
    title: "Haberleşme Hakkı",
    slug: "haberlesme",
    items: [
      "Genel",
      "Haberleşme (sakıncalı mektup)",
      "Haberleşme (sakıncalı mektup hariç)",
    ],
  },
  {
    title: "Aile Hayatı ve Ziyaret Hakkı",
    slug: "ziyaret-aile-iliskisi",
    items: ["Ziyaret Hakkı ve Aile hayatı"],
  },
  {
    title: "İfade Özgürlüğü, Yayın ve Bilgiye Erişim",
    slug: "ifade-yayin-bilgiye-erisim",
    items: [
      "İfade Özgürlüğü",
      "Süreli yayın",
      "Kitap",
    ],
  },
  {
    title: "Sağlık Hakkı",
    slug: "saglik",
    items: [
      "Tıbbi ihmal",
      "Tutulanın sağlık durumunun tutulmayla uyumsuzluğu",
    ],
  },
  {
    title: "Cezaevi Koşulları",
    slug: "fiziksel-kosullar",
    items: [
      "İnfaz Kurumunun fiziki koşulları",
      "Tutma koşulları nedeniyle kötü muamele",
      "Tutma koşulları nedeniyle kötü muamele (tek kişilik oda)",
    ],
  },
  {
    title: "Kötü Muamele ve Güç Kullanımı",
    slug: "kotu-muamele-guc-kullanimi",
    items: [
      "İnfaz kurumunda güç kullanımı",
      "Kamu görevlisinin güç kullanımı",
      "Kamu görevlisinin güç kullanımı sonucu ağır yaralanma / ölüm",
      "Çıplak/detaylı arama",
    ],
  },
  {
    title: "Disiplin Cezaları ve İnfaz Uygulamaları",
    slug: "disiplin-infaz-rejimi",
    items: [
      "Mahkumiyet (infaz)",
      "İnfaz, koşullu salıverme",
      "Mahkumiyet (açığa ayrılma, denetimli serbestlik, şartlı tahliye, mahsup vd.)",
    ],
  },
  {
    title: "Eğitim Hakkı",
    slug: "egitim",
    items: ["Ceza infaz kurumunda eğitim"],
  },
  {
    title: "Nakil ve Sevk İşlemleri",
    slug: "nakil-sevk",
    items: ["Nakil aracının fiziki koşulları"],
  },
  {
    title: "Açlık Grevi",
    slug: "aclik-grevi",
    items: ["Açlık grevi"],
  },
];

export function slugifyTR(text) {
  return text
    .toLowerCase()
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}