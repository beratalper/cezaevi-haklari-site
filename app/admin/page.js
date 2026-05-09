import { cookies } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("admin_auth")?.value;

  const yetkili =
    Boolean(process.env.ADMIN_SECRET) &&
    Boolean(adminAuth) &&
    adminAuth === process.env.ADMIN_SECRET;

  if (!yetkili) {
    return (
      <main className="min-h-screen bg-[#070b14] p-10 text-white">
        <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#0d1320] p-6">
          <h1 className="text-2xl font-semibold">Yetkisiz erişim</h1>

          <Link
            href="/admin/login"
            className="mt-6 inline-block rounded-xl bg-amber-300 px-5 py-3 font-bold text-black"
          >
            Admin girişi yap
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] p-10 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0d1320] p-6">
        <h1 className="text-3xl font-semibold text-[#f3d99b]">
          Admin Panel
        </h1>

        <p className="mt-4 text-slate-400">
          Karar sınıflandırmalarını kontrol edin ve gelen yanlış sınıflandırma bildirimlerini yönetin.
        </p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <a
          href="/admin/siniflandirma"
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-amber-300/50 hover:bg-white/[0.06]"
        >
          <div className="text-lg font-semibold text-amber-300">
            Sınıflandırma Kontrolü
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Kararları toplu olarak gözden geçir, üst/alt kategori ve cezaevi durumunu güncelle.
          </p>
        </a>

        <a
          href="/admin/bildirimler"
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-amber-300/50 hover:bg-white/[0.06]"
        >
          <div className="text-lg font-semibold text-amber-300">
            Yanlış Sınıflandırma Bildirimleri
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            E-postadan gelen bildirimleri ileride burada listeleyebiliriz. Şimdilik gelen e-postadaki admin linkinden ilgili kaydı aç.
          </p>
        </a>
      </div>
      <a
        href="/admin/cezaevi-adaylari"
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-amber-300/50 hover:bg-white/[0.06]"
      >
        <div className="text-lg font-semibold text-amber-300">
          Cezaevi Aday Kararlar
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          AYM cezaevi filtresinde yer alan ancak cezaevi_mi=true olarak işaretlenmemiş kararları incele.
        </p>
      </a>
    </main>
  );
}