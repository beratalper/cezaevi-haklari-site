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
          Giriş başarılı. E-postadaki admin düzenleme linkleri artık şifresiz açılabilir.
        </p>
      </div>
    </main>
  );
}