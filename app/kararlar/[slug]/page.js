import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getKarar(slug) {
  try {
    const headerList = await headers();
    const host = headerList.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";

    const res = await fetch(`${protocol}://${host}/api/kararlar/${slug}`, {
      cache: "no-store",
    });

    const json = await res.json();

    if (!json.ok) {
      console.error("Karar API hata:", {
        slug,
        host,
        error: json.error,
      });
      return null;
    }

    return json.data;
  } catch (error) {
    console.error("Karar detay fetch hatası:", error);
    return null;
  }
}

function BilgilendirmeAlani() {
  return (
    <div className="mt-8 mb-10">
      <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex justify-center">
        <img
          src="/logo.png"
          alt="Cezaevi Hakları"
          className="max-h-40 w-auto opacity-80"
        />
      </div>
    </div>
  );
}

function kararRehberMetni(item) {
  const sonuc = (item.sonuc || "").toLowerCase();
  const basvuruKonusu = item.basvuru_konusu || "";
  const mudahale = item.mudahale_iddiasi_aym || "";
  const sonucAym = item.sonuc_aym || "";

  let kararSonucu = "Anayasa Mahkemesi başvuruyu değerlendirmiştir.";
  let gerekce =
    "Kararın gerekçesi, olayın özelliklerine ve başvurucunun sunduğu bilgi ve belgelere göre şekillenmiştir.";
  let dikkat =
    "Benzer başvurularda olayın tarihi, yapılan idari işlem, buna karşı kullanılan başvuru yolları ve eldeki belgeler açıkça ortaya konulmalıdır.";

  if (sonuc.includes("kabul edilemez")) {
    kararSonucu =
      "Anayasa Mahkemesi bu başvuruda esasa girerek hak ihlali incelemesi yapmamış; başvuruyu kabul edilemez bulmuştur.";

    if (
      sonucAym.toLowerCase().includes("başvuru yolları") ||
      mudahale.toLowerCase().includes("başvuru yolları")
    ) {
      gerekce =
        "Bu sonucun temel nedeni, başvurucunun Anayasa Mahkemesine gelmeden önce kullanması gereken etkili başvuru yollarını tüketmemiş olmasıdır.";
      dikkat =
        "Vatandaş benzer durumda önce infaz hâkimliği, ağır ceza mahkemesi veya ilgili idari/yargısal yolları zamanında kullanmalı; bu süreç tamamlanmadan bireysel başvuru yapmamalıdır.";
    } else if (
      sonucAym.toLowerCase().includes("süre") ||
      mudahale.toLowerCase().includes("süre")
    ) {
      gerekce =
        "Bu sonucun temel nedeni, bireysel başvurunun süresinde yapılmamış olmasıdır.";
      dikkat =
        "Vatandaş tebliğ veya öğrenme tarihini dikkatle takip etmeli; bireysel başvuru süresini kaçırmamalıdır.";
    } else if (
      sonucAym.toLowerCase().includes("açıkça dayanaktan yoksun") ||
      sonucAym.toLowerCase().includes("dayanaktan")
    ) {
      gerekce =
        "Mahkeme, ileri sürülen iddiaların hak ihlali sonucuna ulaşmak için yeterli dayanak içermediği kanaatine varmıştır.";
      dikkat =
        "Vatandaş yalnızca genel şikâyet ileri sürmekle yetinmemeli; hangi işlem nedeniyle hangi hakkının nasıl etkilendiğini somut olay ve belgelerle açıklamalıdır.";
    }
  } else if (sonuc.includes("ihlal") && !sonuc.includes("ihlal olmadığı")) {
    kararSonucu =
      "Anayasa Mahkemesi bu başvuruda başvurucunun iddiasını hak ihlali yönünden haklı bulmuştur.";

    gerekce =
      "Mahkeme, başvuru konusu işlem veya uygulamanın anayasal güvencelerle bağdaşmadığı sonucuna ulaşmıştır.";

    dikkat =
      "Vatandaş benzer durumda işlem tarihini, idarenin gerekçesini, yaptığı itirazları ve uğradığı somut etkiyi belgelemelidir.";
  } else if (sonuc.includes("ihlal olmadığı")) {
    kararSonucu =
      "Anayasa Mahkemesi bu başvuruda hak ihlali olmadığı sonucuna varmıştır.";

    gerekce =
      "Mahkeme, olayın koşullarını ve idarenin gerekçesini birlikte değerlendirerek müdahalenin anayasal sınırlar içinde kaldığını kabul etmiştir.";

    dikkat =
      "Vatandaş benzer başvurularda yalnızca uygulamadan memnun olmadığını değil, uygulamanın neden ölçüsüz veya hukuka aykırı olduğunu somutlaştırmalıdır.";
  } else if (sonuc.includes("düşme")) {
    kararSonucu = "Anayasa Mahkemesi bu başvuruda düşme kararı vermiştir.";

    gerekce =
      "Düşme kararları genellikle başvurunun incelenmesini gerektiren sebebin ortadan kalkması veya başvurunun takipsiz bırakılması gibi nedenlerle verilir.";

    dikkat =
      "Vatandaş başvuru sürecini takip etmeli, Mahkemeden gelen yazılara süresinde cevap vermeli ve başvurusunu güncel tutmalıdır.";
  }

  return {
    konu: basvuruKonusu,
    kararSonucu,
    gerekce,
    dikkat,
  };
}

export default async function KararDetay({ params }) {
  const { slug } = await params;

  const item = await getKarar(slug);

  if (!item) {
    return (
      <main className="min-h-screen bg-[#070b14] p-10 text-white">
        Karar bulunamadı
      </main>
    );
  }

  const rehber = kararRehberMetni(item);

  return (
    <main className="min-h-screen bg-[#070b14] p-10 text-white">
      <a href="/kararlar" className="text-slate-400">
        ← Kararlara dön
      </a>

      <div className="mb-6 flex justify-center">
        <img
          src="/logo.png"
          alt="Cezaevi Hakları"
          className="max-h-20 w-auto opacity-80"
        />
      </div>

      <h1 className="text-center text-4xl font-semibold leading-tight md:text-5xl">
        {item.karar_adi}
      </h1>

      <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-400">
        <div className="rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-3 py-1 text-[#d9bd83]">
          Başvuru No: <span className="text-white">{item.basvuru_no}</span>
        </div>

        {item.karar_tarihi && (
          <div className="rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-3 py-1 text-[#d9bd83]">
            Karar Tarihi:{" "}
            <span className="text-white">{item.karar_tarihi}</span>
          </div>
        )}
      </div>

      <div className="mt-12 flex justify-center">
        <div className="w-full max-w-4xl space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
              Bu karar neden önemli?
            </h3>

            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
              <p>
                <span className="font-semibold text-slate-100">
                  AYM önüne gelen konu:{" "}
                </span>
                {rehber.konu || "Başvuru konusu bilgisi bulunamadı."}
              </p>

              <p>
                <span className="font-semibold text-slate-100">
                  Mahkemenin kararı:{" "}
                </span>
                {rehber.kararSonucu}
              </p>

              <p>
                <span className="font-semibold text-slate-100">
                  Gerekçe bakımından:{" "}
                </span>
                {rehber.gerekce}
              </p>

              <p>
                <span className="font-semibold text-slate-100">
                  Vatandaş neye dikkat etmeli?{" "}
                </span>
                {rehber.dikkat}
              </p>
            </div>
          </div>

          <BilgilendirmeAlani />

          <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
              Başvuru konusu
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {item.basvuru_konusu || "Bilgi bulunamadı"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
              Karar özeti
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Başvurucu, ceza infaz kurumunda uygulanan bir işlem nedeniyle
              bireysel başvuruda bulunmuştur. Anayasa Mahkemesi, başvuruyu
              esasına girmeden kabul edilemez bulmuştur.
            </p>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Mahkeme, iddiaların hak ihlali sonucuna götürecek ölçüde
              somutlaştırılmadığı kanaatine varmıştır.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1320] p-6">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#c9a96e]">
              Benzer başvurularda nelere dikkat edilmeli?
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Bu tür başvurularda süreler özellikle takip edilmelidir. Anayasa
              Mahkemesine gitmeden önce ilgili başvuru yolları kullanılmalı,
              verilen kararlar saklanmalı ve iddialar yalnızca genel şikâyet
              olarak değil, belge ve somut olaylarla desteklenerek sunulmalıdır.
            </p>
          </div>

          <BilgilendirmeAlani />
        </div>
      </div>
    </main>
  );
}