import "./globals.css";

export const metadata = {
  title: "Cezaevi Hakları | AYM Kararları ve Bireysel Başvuru Rehberi",
  description:
    "Cezaevleri, tutuklu ve hükümlü hakları, AYM bireysel başvuru kararları, istatistikler ve örnek dilekçe taslakları hakkında bilgilendirici rehber.",
  keywords: [
    "cezaevi hakları",
    "AYM kararları",
    "bireysel başvuru",
    "tutuklu hakları",
    "hükümlü hakları",
    "kötü muamele yasağı",
    "ceza infaz kurumu",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className="bg-[#fbfaf7] text-[#111827]">
        <header className="sticky top-0 z-50 border-b border-[#e5e1d8] bg-[#fbfaf7]/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
            <a href="/" className="text-xl font-semibold tracking-tight">
              Cezaevi Hakları
            </a>

            <nav className="hidden gap-8 text-sm text-gray-600 md:flex">
              <a href="/makaleler">Makaleler</a>
              <a href="/kararlar">AYM Kararları</a>
              <a href="/istatistikler">İstatistikler</a>
              <a href="/dilekceler">Dilekçeler</a>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-20 border-t border-[#e5e1d8]">
          <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-gray-500">
            © 2026 Cezaevi Hakları — Genel bilgilendirme amaçlıdır.
          </div>
        </footer>
      </body>
    </html>
  );
}