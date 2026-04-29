import Link from "next/link";
import { notFound } from "next/navigation";
import { cezaeviHaklari, slugifyTR } from "@/data/cezaeviHaklari";

export function generateStaticParams() {
  const paths = [];

  cezaeviHaklari.forEach((group) => {
    group.items.forEach((item) => {
      paths.push({
        ustKategori: group.slug,
        altKategori: slugifyTR(item),
      });
    });
  });

  return paths;
}

export default async function AltKategoriPage({ params }) {
  const { ustKategori, altKategori } = await params;

  const group = cezaeviHaklari.find((x) => x.slug === ustKategori);

  if (!group) {
    notFound();
  }

  const title = group.items.find((item) => slugifyTR(item) === altKategori);

  if (!title) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#070b14] px-6 py-20 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap gap-2 text-sm">
          <Link href="/haklar" className="text-amber-300 hover:text-amber-200">
            Haklar
          </Link>

          <span className="text-white/35">/</span>

          <Link
            href={`/haklar/${group.slug}`}
            className="text-amber-300 hover:text-amber-200"
          >
            {group.title}
          </Link>
        </div>

        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
          Alt Konu Başlığı
        </p>

        <h1 className="max-w-5xl text-4xl font-bold leading-tight md:text-5xl">
          {title}
        </h1>

        <p className="mt-8 max-w-4xl text-lg leading-8 text-white/65">
          Bu sayfada, ceza infaz kurumlarında yaşanan hak ihlalleri kapsamında
          <span className="text-white"> {title}</span> başlığıyla bağlantılı
          Anayasa Mahkemesi bireysel başvuru kararları listelenecektir. Bu
          kararlar; hak ihlali iddialarının hangi koşullarda incelendiğini,
          devletin yükümlülüklerinin nasıl değerlendirildiğini ve bireysel
          başvuru yolunda hangi hukuki ölçütlerin öne çıktığını anlamaya yardımcı
          olur.
        </p>

        <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
            Üst Kategori
          </div>

          <div className="mt-3 text-2xl font-bold text-amber-300">
            {group.title}
          </div>

          <div className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
            İncelenen Alt Başlık
          </div>

          <div className="mt-3 text-xl font-semibold text-white">
            {title}
          </div>

          <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-7 text-white/65">
            Sonraki aşamada bu alana ilgili AYM kararları, başvuru numaraları,
            karar sonuçları ve karar detaylarına yönlendiren bağlantılar
            eklenecektir.
          </div>
        </div>
      </section>
    </main>
  );
}