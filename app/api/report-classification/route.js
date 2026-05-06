import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    console.log("REPORT API CALLED");
    console.log("RESEND KEY EXISTS:", !!process.env.RESEND_API_KEY);
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

        const slug = basvuruNo.replace("/", "-");

        const adminUrl =
            `https://cezaevihaklari.com/admin/siniflandirma/${slug}?secret=${process.env.ADMIN_SECRET}`;

        const text = `
Yanlış kategori bildirimi

Karar: ${kararAdi}
Başvuru No: ${basvuruNo}

Karar sayfası:
${pageUrl}

Admin düzenleme sayfası:
${adminUrl}

Kullanıcı notu:
${message || "-"}
`;

        const resendResult = await resend.emails.send({
            from: "Cezaevi Hakları <onboarding@resend.dev>",
            to: ["bakosterit@gmail.com"],
            subject: `Yanlış kategori bildirimi - ${basvuruNo}`,
            text,
            reply_to: "iletisim.cezaevihaklari@gmail.com",
        });

        console.log("RESEND RESULT:", resendResult);

        return Response.json({ ok: true });
    } catch (error) {
        console.error("REPORT ERROR:", error);

        return Response.json(
            { error: "Bildirim gönderilemedi." },
            { status: 500 }
        );
    }
}