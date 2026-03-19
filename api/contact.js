export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Email not configured" });

  try {
    const { name, email, subject, message } = req.body;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "TruckPilot Website <support@truckpilot.ca>",
        to: ["support@truckpilot.ca"],
        reply_to: email,
        subject: `[Website Contact] ${subject} — from ${name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#1a2744;padding:24px;border-radius:12px 12px 0 0;">
              <h2 style="color:#FFD700;margin:0;font-size:20px;">New Contact Form Message</h2>
              <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px;">From TruckPilot website</p>
            </div>
            <div style="background:#fff;padding:32px;border:1px solid #eee;border-radius:0 0 12px 12px;">
              <table style="width:100%;font-size:15px;">
                <tr><td style="color:#888;padding:8px 0;width:100px;font-weight:600;">Name</td><td style="color:#1a1a1a;font-weight:700;">${name}</td></tr>
                <tr><td style="color:#888;padding:8px 0;font-weight:600;">Email</td><td><a href="mailto:${email}" style="color:#243B6E;">${email}</a></td></tr>
                <tr><td style="color:#888;padding:8px 0;font-weight:600;">Subject</td><td style="color:#1a1a1a;">${subject}</td></tr>
              </table>
              <div style="margin-top:20px;padding:20px;background:#F4F1EC;border-radius:10px;">
                <p style="color:#444;line-height:1.7;white-space:pre-wrap;">${message}</p>
              </div>
              <p style="margin-top:20px;font-size:13px;color:#888;">Reply directly to this email to respond to ${name}.</p>
            </div>
          </div>
        `
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
