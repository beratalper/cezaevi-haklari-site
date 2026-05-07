import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminBildirimlerPage() {
  const cookieStore = await cookies();

  const adminAuth =
    cookieStore.get("admin_auth")?.value;

  const yetkili =
    Boolean(process.env.ADMIN_SECRET) &&
    Boolean(adminAuth) &&
    adminAuth === process.env.ADMIN_SECRET;

  if (!yetkili) {
    return (
      <main className="min-h-screen bg-[#070b14] p-10 text-white">
        Yetkisiz erişim
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070b14] p-6 text-white">
      <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-[#0d1320] p-6">
        <h1 className="text-3xl font-semibold text-[#f3d99b]">
          Yanlış Sınıflandırma Bildirimleri
        </h1>

        <p className="mt-4 text-slate-400">
          Şimdilik bildirimler e-posta üzerinden geliyor.
          Daha sonra burada veritabanına kaydedilmiş bildirimleri listeleyebiliriz.
        </p>
      </div>
    </main>
  );
}