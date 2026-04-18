import { createTransporter } from "@/lib/email";

export async function POST(req) {
  try {
    const body = await req.json();

    const transporter = createTransporter();

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: body.to,
      subject: body.subject,
      text: body.message,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Email failed" }, { status: 500 });
  }
}
