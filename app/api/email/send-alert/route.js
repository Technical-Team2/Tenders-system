export const dynamic = "force-dynamic";

import nodemailer from "nodemailer";

function getTransporter() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    throw new Error("Missing SMTP configuration");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(req) {
  try {
    const transporter = getTransporter();

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: "test@example.com",
      subject: "Test Email",
      text: "Hello from TenderScope",
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
