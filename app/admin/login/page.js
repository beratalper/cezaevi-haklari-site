export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }) {
  const sp = await searchParams;
  const next = sp?.next || "/admin";

  return (
    <main className="min-h-screen bg-[#070b14] p-10 text-white">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#0d1320] p-6">
        <h1 className="text-3xl font-semibold text-[#f3d99b]">
          Admin Girişi
        </h1>

        <form
          action="/api/admin/login"
          method="POST"
          className="mt-8 space-y-5"
        >
          <input type="hidden" name="next" value={next} />

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Şifre
            </label>

            <input
              type="password"
              name="password"
              className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-amber-300 px-6 py-3 font-bold text-black transition hover:bg-[#e2c17c]"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </main>
  );
}