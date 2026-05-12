import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();

    const { kaynakMetinler } = body;

    const prompt = `
Aşağıdaki Anayasa Mahkemesi karar pasajlarını esas alarak:

- Vatandaşın anlayabileceği sade ve açık bir dil kullan
- Gereksiz akademik ve teknik hukuk dilinden kaçın
- Önce somut olayın ne olduğunu açıkla
- AYM’nin olayı hangi hak veya özgürlük kapsamında değerlendirdiğini belirt
- Mahkemenin neden ihlal veya ihlal olmadığı sonucuna vardığını sade biçimde anlat
- Kararın vatandaş açısından ne anlama geldiğini açıkla
- Benzer durumda olan kişiler açısından nasıl bir sonuç çıkabileceğini değerlendir
- SEO uyumlu ara başlıklar oluştur
- Yazı için SEO başlığı üret
- 160 karakterlik SEO açıklaması oluştur
- Yazıyı kolay okunabilir kısa paragraflarla hazırla
- Yalnızca verilen karar pasajlarına dayan
- Verilmeyen karar, olay, ilke veya gerekçe uydurma
- Kesin hukuki tavsiye verme
- Yazının sonunda kısa bir genel değerlendirme yap

Karar pasajları:

${kaynakMetinler}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Sen AYM bireysel başvuru kararlarını analiz eden uzman bir hukuk editörüsün.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
    });

    const text =
      completion.choices[0]?.message?.content || "";

    return Response.json({
      success: true,
      text,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}