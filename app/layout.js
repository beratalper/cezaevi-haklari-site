import "./globals.css";
import { Inter, Cormorant_Garamond } from "next/font/google";
import Navbar from "../components/Navbar";
import Script from "next/script"; // 👈 EKLENDİ

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata = {
  title: "Cezaevi Hakları | Tutuklu ve Hükümlü Hakları, AYM Kararları",
  description:
    "Cezaevi hakları, tutuklu ve hükümlü hakları, açık görüş, telefon hakkı, sağlık hakkı, disiplin cezaları, AYM kararları ve bireysel başvuru rehberi.",
  keywords: [
    "cezaevi hakları",
    "tutuklu hakları",
    "hükümlü hakları",
    "mahpus hakları",
    "ceza infaz kurumu",
    "AYM kararları",
    "Anayasa Mahkemesi bireysel başvuru",
    "bireysel başvuru rehberi",
    "kötü muamele yasağı",
    "sağlık hakkı",
    "telefon hakkı",
    "açık görüş hakkı",
    "kapalı görüş hakkı",
    "ziyaret hakkı",
    "haberleşme hakkı",
    "disiplin cezası",
    "infaz hakimliği",
    "etkili başvuru yolu",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7518046066826938"
          crossorigin="anonymous"></script>
        <Script
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX"
          crossOrigin="anonymous"
        />
      </head>

      <body
        className={`${inter.variable} ${cormorant.variable} bg-[#070b14] text-white antialiased`}
      >
        <Navbar />

        {children}

        <footer className="border-t border-white/10 bg-[#05080f]">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
            <div>
              <div className="text-xl font-bold">
                Cezaevi<span className="text-[#c9a96e]">Hakları</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Cezaevlerinde yaşanan hak ihlallerine ilişkin Anayasa Mahkemesi kararlarını sadeleştiren bilgilendirici içerikler.
              </p>
            </div>

            <div>
              <div className="font-semibold">İçerikler</div>
              <div className="mt-4 space-y-2 text-sm text-slate-400">
                <div><a href="/kararlar">AYM Kararları</a></div>
                <div><a href="/makaleler">Makaleler</a></div>
                <div><a href="/istatistikler">İstatistikler</a></div>
              </div>
            </div>

            <div>
              <div className="font-semibold">Kurumsal</div>
              <div className="mt-4 space-y-2 text-sm text-slate-400">
                <div><a href="/hakkimizda">Hakkımızda</a></div>
                <div><a href="/gizlilik">Gizlilik</a></div>
                <div><a href="/yasal-uyari">Yasal Uyarı</a></div>
                <div><a href="/iletisim">İletişim</a></div>
              </div>
            </div>

            <div>
              <div className="font-semibold">Bilgi</div>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                İçerikler genel bilgilendirme amaçlıdır. Hukuki danışmanlık yerine geçmez.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 py-5 text-center text-sm text-slate-500">
            © 2026 Cezaevi Hakları
          </div>
        </footer>
      </body>
    </html>
  );
}