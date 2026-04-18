import nodemailer from "nodemailer";

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
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
    const { tenderId, score } = await req.json();

    if (!tenderId || score === undefined) {
      return Response.json(
        { error: 'Tender ID and score are required' },
        { status: 400 }
      );
    }

    const transporter = getTransporter();

    // Get tender details from database (simplified for example)
    // In a real implementation, you would fetch from your database
    const tender = {
      id: tenderId,
      title: 'Sample Tender',
      organization: 'Sample Organization',
      description: 'Sample description'
    };

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: "test@example.com",
      subject: `High-Score Tender Alert: ${tender.title}`,
      html: `
        <h2>Tender Alert</h2>
        <p><strong>Title:</strong> ${tender.title}</p>
        <p><strong>Organization:</strong> ${tender.organization}</p>
        <p><strong>AI Score:</strong> ${score}/100</p>
        <p><strong>Description:</strong> ${tender.description}</p>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in send-alert API:', error);
    return Response.json(
      { error: 'Failed to send tender alerts' },
      { status: 500 }
    );
  }
}
