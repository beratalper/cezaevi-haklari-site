require("dotenv").config();
const { Pool } = require("pg");
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// 🔥 TEST İÇİN SADECE BU 4 KARAR
const LIMIT_TEST = true;

const PROMPT = `
Sen bir anayasa hukuku uzmanı ve sade anlatım konusunda uzman bir hukuk yazarısın.

Görevin, Anayasa Mahkemesi bireysel başvuru kararlarına ait ham verileri kullanarak vatandaşın anlayabileceği ama hukuki ciddiyeti koruyan metinler üretmektir.

KESİN KURALLAR:
- Sadece Türkçe yaz.
- İngilizce kelime kullanma.
- "Yüksek Mahkeme", "hukuki çerçeveyi netleştirmektedir", "kritik rol oynamaktadır" gibi klişe ifadeler kullanma.
- Soyut ifadeleri mümkün olduğunca somutlaştır.
- Vatandaşın kendi durumuyla kıyas yapabileceği açıklamalar kur.
- Kararda olmayan bilgiyi uydurma.
- Eğer ayrıntı yoksa, kesin konuşma; "karar verilerine göre" veya "eldeki bilgilere göre" gibi dikkatli ifadeler kullan.
- Başlıkları Markdown başlığı olarak yazma.
- "###", "####", "1.", "2." kullanma.
- Çıktıyı mutlaka aşağıdaki dört etiketle ver.

EK ZORUNLU KURALLAR:
- Başvuru konusu alanının son cümlesi mutlaka şu yapıda bitecek:
  "Başvurucu, bu nedenle ... hakkının/haklarının ihlal edildiğini ileri sürerek Anayasa Mahkemesine bireysel başvuruda bulunmuştur."
- Karar metninde açıkça yazmıyorsa gün, süre, itiraz süresi, başvuru süresi gibi kesin rakam verme.
- "Genellikle", "çoğu zaman", "15 gün", "30 gün" gibi süre ifadelerini ancak karar metninde açıkça varsa kullan.
- Sonuç kısmında sadece AYM Sonucu alanıyla uyumlu ifadeler kur.
- Karar özeti en az 4 cümle olacak:
  1. Başvurucunun iddiası
  2. İdari/yargısal süreç
  3. AYM’nin değerlendirmesi
  4. Sonuç

EN KRİTİK KURAL:
- Karar metninde açıkça yer almayan hiçbir bilgi EKLEME.
- Olay, tarih, kişi, işlem, gerekçe uydurma.
- Eğer bir bilgi karar metninde açık değilse:
  - ya hiç yazma
  - ya da "karar metninde bu konuda ayrıntı yer almamaktadır" şeklinde belirt.

- Özellikle şunları ASLA uydurma:
  - mahkeme kararı detayları
  - ceza türü / sonuçlar
  - süreler
  - kurum isimleri
  - olayın gelişimi

- Emin olmadığın hiçbir bilgiyi kesin cümleyle yazma.

GÜVENLİK KURALI:
- Başvurucunun ileri sürdüğü hakları yazarken sadece "Hak / Müdahale İddiası" ve "Başvuru Konusu" alanlarında yer alan hakları kullan.
- Karar sonucu ile çelişen cümle kurma.
- "İhlal", "ihlal yok", "kabul edilemez", "süre aşımı", "açıkça dayanaktan yoksunluk" gibi sonuçları mutlaka "AYM Sonucu" alanına uygun yaz.
- Karar metninde açıkça görmediğin bilgiyi kesin bilgi gibi yazma.
- Emin değilsen "karar verilerine göre" veya "eldeki metinden anlaşıldığı kadarıyla" ifadelerini kullan.
- Başvuru konusu alanını üretirken mümkün olduğunca verilen "Başvuru Konusu" metnine sadık kal; yeni hak türleri ekleme.

ÇIKTIYI SADECE GEÇERLİ JSON OLARAK VER.

Şu alanlar dışında hiçbir şey yazma:

{
  "ai_basvuru_konusu": "...",
  "ai_karar_ozeti": "...",
  "ai_neden_onemli": "...",
  "ai_benzer_basvuruda_dikkat": "..."
}

BAŞVURU KONUSU:
- Olayı kısa ve açık anlat.
- Son cümlede başvurucunun hangi hakların ihlal edildiğini ileri sürerek Anayasa Mahkemesine bireysel başvuruda bulunduğunu belirt.

KARAR ÖZETİ:
- Başvurucunun iddiasını açıkla.
- Sürecin önemli aşamalarını anlat.
- Anayasa Mahkemesinin neden bu sonuca vardığını açıkla.
- Vatandaşın anlayacağı şekilde 1-2 açıklayıcı cümle ekle.
- Sadece sonuç söyleme; gerekçeyi de anlat.

BU KARAR NEDEN ÖNEMLİ:
- Karardan çıkan genel dersi anlat.
- Soyut hukuk dili kullanma.
- Gerekirse örnek ver.
- Vatandaşın "benim durumum buna benziyor mu?" diye kıyas yapabilmesini sağla.

BENZER BAŞVURULARDA DİKKAT:
- Yol gösterici yaz.
- Süre vurgusu yap.
- Somut delil örnekleri ver.
- Gerekirse madde işaretleri kullan.
- "Şu yapılmazsa başvuru reddedilebilir" gibi açık uyarılar kullan.

REFERANS ÜSLUP ÖRNEĞİ:

BASVURU_KONUSU:
Başvurucu, ceza infaz kurumunda infaz koruma memuru tarafından kendisine yönelik sözlü ve fiili saldırıda bulunulduğunu iddia etmiştir. Bu olayla ilgili yaptığı şikâyet üzerine yürütülen ceza soruşturmasının etkisiz kaldığını ileri süren başvurucu, fiziksel ve ruhsal bütünlüğünün korunması hakkı ile etkili başvuru hakkının ihlal edildiğini belirterek Anayasa Mahkemesine bireysel başvuruda bulunmuştur.

KARAR_OZETI:
Başvurucu, infaz koruma memurunun kendisine hakaret ettiğini ve fiziksel müdahalede bulunduğunu ileri sürmüş; bu olayla ilgili yürütülen soruşturmanın yetersiz olduğunu iddia etmiştir. Olay sonrası adli makamlarca soruşturma başlatılmış, tarafların ifadeleri alınmış ve mevcut deliller değerlendirilerek süreç tamamlanmıştır.

Anayasa Mahkemesi, öncelikle başvurucunun maruz kaldığını iddia ettiği eylemlerin niteliğini incelemiş ve bu eylemlerin işkence veya eziyet yasağı kapsamında değerlendirilebilmesi için gerekli olan **asgari ağırlık düzeyine ulaşmadığını** belirtmiştir. Mahkemeye göre her fiziksel veya sözlü müdahale bu kapsamda değerlendirilemez; müdahalenin süresi, yoğunluğu ve kişi üzerindeki etkisi birlikte değerlendirilmelidir.

Yani Mahkemeye göre, olayla ilgili gerçekten bir inceleme yapılmışsa, ifadeler alınmışsa ve deliller değerlendirilmişse, sadece sonuçtan memnun olunmaması “etkisiz soruşturma” anlamına gelmez.

NEDEN_ONEMLI:
Bu karar, cezaevinde yaşanan her olumsuz olayın otomatik olarak “kötü muamele” sayılmadığını göstermektedir.

Bir olayın bu kapsamda değerlendirilebilmesi için belirli bir ağırlığa ulaşması gerekir. Örneğin kısa süreli ve sınırlı etkili bir tartışma çoğu durumda bu kapsamda değerlendirilmezken; ciddi yaralanmaya yol açan, sistematik veya ağır müdahaleler farklı şekilde ele alınabilir.

DIKKAT_EDILMELI:
Bu tür başvurularda olay mutlaka **ayrıntılı ve somut şekilde** anlatılmalıdır. Genel ifadeler yerine olayın tarihi, nerede gerçekleştiği, olaya kimlerin dahil olduğu ve olayın nasıl yaşandığı açıkça belirtilmelidir.

**Somut delil** olarak şunlar önemlidir:

- darp raporu
- kamera kaydı
- tanık beyanı
- şikâyet dilekçesi
- savcılık soruşturma evrakı

Ayrıca başvuru yapılmadan önce idari ve yargısal yollar tüketilmeli ve bireysel başvuru süresi kaçırılmamalıdır.
`;

async function run() {
    const client = await pool.connect();

    try {
        const result = await client.query(`
      SELECT
  id,
  basvuru_no,
  karar_adi,
  karar_tarihi,
  sonuc,
  basvuru_konusu,
  mudahale_iddiasi_aym,
  sonuc_aym,
  metin
FROM kararlar
      ${LIMIT_TEST ? `WHERE basvuru_no IN (
  '2013/1822',
  '2012/969',
  '2014/648',
  '2014/10204',
  '2021/54500',
  '2022/52566',
  '2022/39911',
  '2023/68522',
  '2022/72892',
  '2022/594'
)` : ""}
    `);

        for (const row of result.rows) {
            console.log("İşleniyor:", row.basvuru_no);

            const tamMetin = row.metin || "";

            const input = `
Başvuru No: ${row.basvuru_no}
Karar Adı: ${row.karar_adi || ""}
Karar Tarihi: ${row.karar_tarihi || ""}
Genel Sonuç: ${row.sonuc || ""}
Başvuru Konusu: ${row.basvuru_konusu || ""}
Hak / Müdahale İddiası: ${row.mudahale_iddiasi_aym || ""}
AYM Sonucu: ${row.sonuc_aym || ""}

Karar Metni:
${tamMetin.slice(0, 18000)}
`;

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: PROMPT },
                    { role: "user", content: input },
                ],
                temperature: 0.1,
                response_format: { type: "json_object" },
            });

            const text = response.choices[0].message.content;

            let parsed;

            try {
                parsed = JSON.parse(text);
            } catch (e) {
                console.error("JSON parse hatası:", row.basvuru_no);
                console.error(text);
                continue;
            }

            const ai_basvuru_konusu = parsed.ai_basvuru_konusu || "";
            const ai_karar_ozeti = parsed.ai_karar_ozeti || "";
            const ai_neden_onemli = parsed.ai_neden_onemli || "";
            const ai_benzer_basvuruda_dikkat =
                parsed.ai_benzer_basvuruda_dikkat || "";

            await client.query(
                `
        UPDATE kararlar
        SET 
          ai_basvuru_konusu = $1,
          ai_karar_ozeti = $2,
          ai_neden_onemli = $3,
          ai_benzer_basvuruda_dikkat = $4
        WHERE id = $5
        `,
                [
                    ai_basvuru_konusu,
                    ai_karar_ozeti,
                    ai_neden_onemli,
                    ai_benzer_basvuruda_dikkat,
                    row.id,
                ]
            );

            console.log("✔ Kaydedildi:", row.basvuru_no);
        }
    } catch (err) {
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
}

run();