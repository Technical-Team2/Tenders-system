import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

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
