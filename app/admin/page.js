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
      <div className="flex items-start justify-between gap-4">

        <div>
          <h1 className="text-3xl font-semibold text-[#f3d99b]">
            Admin Panel
          </h1>
        </div>

        <form
          action="/api/admin/logout"
          method="POST"
        >
          <button
            type="submit"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            Çıkış Yap
          </button>
        </form>

      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <a href="/admin/siniflandirma" className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition duration-200 hover:-translate-y-1 hover:border-amber-300/50 hover:bg-white/[0.06]" >

          <div className="text-xl font-semibold text-amber-300 transition group-hover:text-[#f3d99b]">
            Sınıflandırma Kontrolü
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Kararları toplu olarak gözden geçir, üst/alt kategori ve cezaevi durumunu güncelle.
          </p>
        </a>
        <a href="/admin/bildirimler" className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition duration-200 hover:-translate-y-1 hover:border-amber-300/50 hover:bg-white/[0.06]" >
          <div className="text-xl font-semibold text-amber-300 transition group-hover:text-[#f3d99b]">
            Yanlış Sınıflandırma Bildirimleri
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Kullanıcılardan gelen yanlış sınıflandırma bildirimlerini incele.
          </p>
        </a>
        <a href="/admin/cezaevi-adaylari" className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition duration-200 hover:-translate-y-1 hover:border-amber-300/50 hover:bg-white/[0.06]" >
          <div className="text-xl font-semibold text-amber-300 transition group-hover:text-[#f3d99b]">
            Cezaevi Aday Kararlar
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            AYM cezaevi filtresinde bulunan ancak henüz işaretlenmemiş kararları incele.
          </p>
        </a>
        <a href="/admin/siniflandirma" className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition duration-200 hover:-translate-y-1 hover:border-amber-300/50 hover:bg-white/[0.06]" >
          <div className="text-xl font-semibold text-amber-300 transition group-hover:text-[#f3d99b]">
            Etiket Yönetimi
          </div>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            Kararlara etiket ekle, etiket kaldır ve karar-etiket ilişkilerini yönet.
          </p>
        </a>
        <a href="/admin/cezaevi-adaylari" className="group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition duration-200 hover:-translate-y-1 hover:border-amber-300/50 hover:bg-white/[0.06]" >
          <div className="text-xl font-semibold text-amber-300 transition group-hover:text-[#f3d99b]">
            AYM Tarama Workflow
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Yeni AYM arama sonuçlarını scrape ederek moderasyon kuyruğuna aktar.
          </p>
        </a>
      </div>

    </main>
  );
}