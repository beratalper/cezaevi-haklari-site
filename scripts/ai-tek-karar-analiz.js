import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const kararMetni = `
ERTUĞRUL AKIN BAŞVURUSU
Başvuru Numarası: 2017/38027
Karar Tarihi: 9/7/2020

Başvuru, ceza infaz kurumunda tutuklu olarak bulunan başvurucuya gönderilen mektubun sakıncalı olduğu gerekçesiyle alıkonulması nedeniyle haberleşme hürriyetinin ihlal edildiği iddiasına ilişkindir.

Ceza İnfaz Kurumu Disiplin Kurulu, yabancı dil ile şifrelenmiş gizli yazışma ve haberleşme şüphesi taşıdığı gerekçesiyle mektubun sakıncalı olduğuna ve başvurucuya teslim edilmemesine karar vermiştir.

Anayasa Mahkemesi, mektubun Türkçe kısmına ilişkin ayrı değerlendirme yapılmadan mektubun tümünün alıkonulmasını ölçülü bulmamıştır.

Sonuç: Haberleşme hürriyetinin ihlal edildiğine karar verilmiştir.
`;

const prompt = `
Aşağıdaki AYM bireysel başvuru kararını analiz et.

Sadece geçerli JSON döndür. Açıklama yazma.

JSON şablonu:

{
  "basvuru_no": "",
  "karar_adi": "",
  "cezaevi_ile_ilgili_mi": true,
  "ana_olay_tipi": "",
  "alt_olay_tipi": "",
  "hak": "",
  "sonuc": "",
  "kurum_islemi": "",
  "basvurucu_iddiasi": "",
  "aym_degerlendirmesi_kisa": "",
  "etiketler": []
}

Kurallar:
- Sadece karar metninde bulunan bilgiye dayan.
- Emin olmadığın alanı boş string bırak.
- ana_olay_tipi kısa ve genel olsun.
- alt_olay_tipi daha özel olsun.
- etiketler en fazla 5 tane olsun.
- Hukuki yorum yapma.
- JSON dışında hiçbir metin yazma.

Karar metni:

${kararMetni}
`;

async function test() {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  console.log(response.output_text);
}

test();