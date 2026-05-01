export const metadata = {
  title: "İletişim | Cezaevi Hakları",
  description: "Cezaevi Hakları iletişim sayfası.",
};

export default function IletisimPage() {
  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-5xl font-semibold">İletişim</h1>

        <div className="mt-8 space-y-5 text-sm leading-7 text-slate-300">
          <p>
            Görüş, öneri, düzeltme talepleri veya iş birliği konuları için bizimle
            iletişime geçebilirsiniz.
          </p>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-slate-400">E-posta</p>
            <p className="break-words overflow-hidden mt-2 text-lg font-semibold text-[#d9bd83]">
              iletisim.cezaevihaklari@cezaevihaklari.com
            </p>
          </div>

          <p className="text-slate-500">
            Not: Bu iletişim kanalı hukuki danışmanlık hizmeti vermek amacıyla
            kullanılmamaktadır.
          </p>
        </div>
      </div>
    </main>
  );
}