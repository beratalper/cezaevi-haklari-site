import data from "../../data/kararlar.json";

function badgeClass(sonuc) {
  if (sonuc === "İhlal")
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  if (sonuc === "İhlal Olmadığı")
    return "border-blue-400/30 bg-blue-400/10 text-blue-300";
  if (sonuc === "Kabul Edilemezlik")
    return "border-slate-400/30 bg-slate-400/10 text-slate-300";
  if (sonuc === "Yetkisizlik")
    return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
  if (sonuc === "Ret")
    return "border-red-400/30 bg-red-400/10 text-red-300";

  return "border-slate-400/30 bg-slate-400/10 text-slate-300";
}

function konuEtiketi(konu = "") {
  const text = konu.toLowerCase();

  if (text.includes("sağlık") || text.includes("tedavi") || text.includes("hastane")) return "Sağlık Hakkı";
  if (text.includes("telefon")) return "Telefon Hakkı";
  if (text.includes("mektup") || text.includes("haberleşme")) return "Mektup ve Haberleşme";
  if (text.includes("görüş") || text.includes("ziyaret")) return "Görüş Hakkı";
  if (text.includes("disiplin")) return "Disiplin Cezası";
  if (text.includes("nakil") || text.includes("sevk")) return "Nakil";
  if (text.includes("kötü muamele") || text.includes("işkence")) return "Kötü Muamele Yasağı";

  return "Cezaevi Hakları";
}

function kisaAnaliz(item) {
  if (item.sonuc === "İhlal") {
    return "Bu kararda Anayasa Mahkemesi, başvurucunun iddiası bakımından hak ihlali sonucuna ulaşmıştır. Benzer olaylarda başvuru konusu, ihlalin ağırlığı, idarenin gerekçesi ve etkili başvuru yollarının kullanılıp kullanılmadığı birlikte değerlendirilmelidir.";
  }

  if (item.sonuc === "Kabul Edilemezlik") {
    return "Bu kararda başvuru esas yönünden incelenmeden kabul edilemez bulunmuştur. Benzer başvurularda süre, başvuru yollarının tüketilmesi, açıkça dayanaktan yoksunluk ve mağdur sıfatı gibi usul koşulları özellikle önem taşır.";
  }

  if (item.sonuc === "İhlal Olmadığı") {
    return "Bu kararda Anayasa Mahkemesi ihlal olmadığı sonucuna ulaşmıştır. Benzer olaylarda müdahalenin kanuni dayanağı, meşru amacı ve ölçülülüğü belirleyici olabilir.";
  }

  return "Bu karar, ceza infaz kurumları bağlamında bireysel başvuru denetimine ilişkin değerlendirme içerir. Karar sonucu, başvuru konusu ve benzer içtihatlar birlikte incelenmelidir.";
}

export default async function KararDetay({ params }) {
  const { slug } = await params;
  const no = slug.replace("-", "/");

  const item = data.find((x) => x.basvuru_no === no);

  if (!item) {
    return (
      <main className="min-h-screen bg-[#070b14] px-6 py-20 text-white">
        <section className="mx-auto max-w-5xl">
          <h1 className="font-serif text-5xl font-semibold">
            Karar bulunamadı
          </h1>
        </section>
      </main>
    );
  }

  const kategori = konuEtiketi(item.konu);

  const benzer = data
    .filter(
      (x) =>
        x.basvuru_no !== item.basvuru_no &&
        konuEtiketi(x.konu) === kategori
    )
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#c9a96e22,transparent_35%)]" />

        <div className="relative mx-auto max-w-5xl">
          <a
            href="/kararlar"
            className="mb-10 inline-block text-sm text-slate-400 hover:text-[#d9bd83]"
          >
            ← Kararlara dön
          </a>

          <div className="mb-5 inline-flex rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-4 py-2 text-sm font-semibold text-[#d9bd83]">
            {kategori}
          </div>

          <h1 className="font-serif text-4xl font-semibold leading-tight md:text-6xl">
            {item.baslik}
          </h1>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              Başvuru No: {item.basvuru_no}
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              Karar Tarihi: {item.karar_tarihi}
            </div>

            <div
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${badgeClass(
                item.sonuc
              )}`}
            >
              {item.sonuc}
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="text-sm text-slate-400">Karar Türü</div>
              <div className="mt-2 text-xl font-semibold text-[#d9bd83]">
                Bireysel Başvuru
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="text-sm text-slate-400">Sonuç</div>
              <div className="mt-2 text-xl font-semibold text-white">
                {item.sonuc}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="text-sm text-slate-400">Konu Etiketi</div>
              <div className="mt-2 text-xl font-semibold text-white">
                {kategori}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">
              Başvuru Konusu
            </div>

            <p className="text-lg leading-9 text-slate-300">{item.konu}</p>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-[#0d1320] p-8">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">
              Kısa Analiz
            </div>

            <p className="leading-8 text-slate-300">{kisaAnaliz(item)}</p>
          </div>

          <div className="mt-8 rounded-3xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 p-8">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">
              Pratik Anlamı
            </div>

            <p className="leading-8 text-slate-200">
              Bu karar, benzer cezaevi hakları başvurularında olayın hangi
              hak kategorisi içinde değerlendirilebileceğini ve başvuru yolunun
              nasıl kurulması gerektiğini anlamak için kullanılabilir.
            </p>

            <a
              href={`https://kararlarbilgibankasi.anayasa.gov.tr/BB/${item.basvuru_no}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-2xl border border-[#c9a96e]/30 bg-[#070b14]/60 px-5 py-3 text-sm font-semibold text-[#d9bd83] transition hover:border-[#c9a96e]/60 hover:bg-[#070b14]"
            >
              Resmî AYM kararına git →
            </a>
          </div>

          {benzer.length > 0 && (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
              <div className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#c9a96e]">
                Benzer Kararlar
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {benzer.map((x) => (
                  <a
                    key={x.basvuru_no}
                    href={`/kararlar/${x.basvuru_no.replace("/", "-")}`}
                    className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#c9a96e]/50"
                  >
                    <div className="font-semibold text-white">{x.baslik}</div>
                    <div className="mt-2 text-sm text-slate-400">
                      {x.basvuru_no}
                    </div>
                    <div className="mt-3 text-xs font-semibold text-[#d9bd83]">
                      {konuEtiketi(x.konu)}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}