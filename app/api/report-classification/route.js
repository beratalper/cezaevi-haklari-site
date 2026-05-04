import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      kararAdi,
      basvuruNo,
      pageUrl,
      message,
    } = body;

    if (!kararAdi || !basvuruNo || !pageUrl) {
      return Response.json(
        { error: "Eksik bilgi gönderildi." },
        { status: 400 }
      );
    }

    const text = `
Yanlış kategori bildirimi

Karar: ${kararAdi}
Başvuru No: ${basvuruNo}
Sayfa: ${pageUrl}

Kullanıcı notu:
${message || "-"}
`;

    await resend.emails.send({
      from: "Cezaevi Hakları <onboarding@resend.dev>",
      to: ["iletisim.cezaevihaklari@gmail.com"],
      subject: "Yanlış kategori bildirimi",
      text,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Bildirim gönderilemedi." },
      { status: 500 }
    );
  }
}