import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import pkg from "pg";
import fs from "fs";

const { Pool } = pkg;

const MODEL = "gpt-4.1-mini";
const QUALITY_VERSION = "genel-ai-quality-v2";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function cleanJsonText(text) {
  return String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

const QUALITY_PROMPT = `
Sen Anayasa Mahkemesi bireysel başvuru kararları için kıdemli hukuk editörü ve kalite denetim uzmanısın.

Görevin:
Verilen karar kaydı için üretilen dört temel AI alanını ayrı ayrı değerlendirerek kalite testi yapmak:

1. ai_karar_ozeti
2. ai_neden_onemli
3. ai_benzer_basvuruda_dikkat
4. ai_kural

Her ana alan için sadece şu sonuçlardan birini ver:
- "geçti"
- "geçemedi"
- "kontrol_edilecek"

ZORUNLU DEĞERLENDİRME ÖLÇÜTLERİ:

1. ai_karar_ozeti (OLAY TABANLI OLMALIDIR):
   - Karar özeti sadece "Başvurunun ... yönünden ihlal edildiğine karar verilmiştir" gibi kuru bir hüküm listesi olmamalıdır ("geçemedi").
   - Kesinlikle davanın temelini oluşturan somut OLAYI ve olguları içermelidir (örn. başvurucunun hangi eylemden, hangi konuşmadan veya memuriyetten dolayı disiplin cezası aldığı, hangi mülküne el konulduğu vb. beşeri olay anlatılmalıdır).
   - "İlgili Hukuk" tabanlı mevzuat maddeleri veya davanın boş mahkeme duruşma süreçleri yerine, doğrudan davanın özünü ve başvurucunun başına gelen olayı netçe ortaya koymalıdır.
   - Hüküm / karar sonucuyle (İhlal, Kabul Edilemez vb.) tam uyumlu olmalı ve çelişki barındırmamalıdır ("geçemedi").

2. ai_kural (Genel Geçer İçtihat İlkesi):
   - Kesinlikle davanın özel isimlerini (Ahmet, Şevki, Mehmet vb.), dava esas/karar numaralarını veya özel tarihleri İÇERMEMELİDİR ("geçemedi").
   - Gelecekteki tüm benzer uyuşmazlıklara ışık tutacak kadar kurumsal, genel, kapsayıcı ve güçlü olmalıdır.
   - 1 cümle sınırını aşabilir, yeter ki anlamı bozmayacak tutarlılıkta ve kapsayıcılıkta olsun.

3. ai_neden_onemli (Anlatım Uyumu):
   - "ai_karar_ozeti" kısmında anlatılan somut olayla bütünüyle uyumlu olmalıdır. Örn. Özette hiç bahsedilmeyen bir "konuşma bağlamı" veya "çelişkili delil" tabiri neden önemli kısmında yer alırsa, havada kaldığı için "geçemedi" veya "kontrol_edilecek" verilmelidir.

4. ai_arama_onerileri:
   - Kullanıcının arama esnasında karşılaşacağı akıllı arama önerileridir. Boş olmamalı, yüksek kaliteli hukuk terimlerinden oluşmalıdır.

Cevap SADECE JSON formatında olmalıdır. JSON dışında hiçbir şey yazma.

ÇIKTI FORMATI:
{
  "ai_karar_ozeti_kalite": "geçti",
  "ai_neden_onemli_kalite": "geçti",
  "ai_benzer_basvuruda_dikkat_kalite": "geçti",
  "ai_kural_kalite": "geçti",
  "not": "kısa açıklama (neden geçemediği veya hangi kriterlere uymadığı)"
}
`;

export async function kaliteKontrolYeni(row) {
  const input = {
    basvuru_no: row.basvuru_no,
    karar_adi: row.karar_adi,
    sonuc: row.sonuc,
    sonuc_aym: row.sonuc_aym,
    basvuru_konusu: row.basvuru_konusu,
    hak_ozgurluk_aym: row.hak_ozgurluk_aym,
    mudahale_iddiasi_aym: row.mudahale_iddiasi_aym,

    ai_karar_ozeti: row.ai_karar_ozeti,
    ai_neden_onemli: row.ai_neden_onemli,
    ai_benzer_basvuruda_dikkat: row.ai_benzer_basvuruda_dikkat,
    ai_kural: row.ai_kural,
    ai_arama_onerileri: row.ai_arama_onerileri,

    // Olay ve olgular süzgeci için dökümanın başı ve sonunu gönderiyoruz
    metin_baslangici: String(row.metin || "").slice(0, 15000),
    hukum_bolumu: String(row.metin || "").slice(-8000),
  };

  const res = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: QUALITY_PROMPT },
      { role: "user", content: JSON.stringify(input) },
    ],
  });

  return JSON.parse(cleanJsonText(res.choices[0].message.content));
}
