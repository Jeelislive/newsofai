import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Resend API key not configured" }, { status: 500 });
    }

    // Send welcome email via Resend
    await resend.emails.send({
      from: "ClaudeWire <onboarding@resend.dev>",
      to: email,
      subject: "⚡ Welcome to ClaudeWire — You're in!",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Welcome to ClaudeWire</title>
</head>
<body style="margin:0;padding:0;background:#050508;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050508;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#111118;border-radius:20px;border:1px solid #2d2d42;overflow:hidden;max-width:560px;width:100%;">
          <!-- Header gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#8b5cf6,#a78bfa,#f97316);padding:40px 40px 32px;text-align:center;">
              <div style="display:inline-block;background:rgba(0,0,0,0.3);border-radius:14px;padding:10px 14px;border:1px solid rgba(255,255,255,0.2);margin-bottom:20px;">
                <span style="font-size:20px;">✦</span>
              </div>
              <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0 0 8px;letter-spacing:-0.5px;">
                You&apos;re on ClaudeWire 🎉
              </h1>
              <p style="color:rgba(255,255,255,0.75);font-size:14px;margin:0;">
                Real-time Claude &amp; Anthropic intelligence, delivered instantly.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Hey there 👋<br/><br/>
                You&apos;re now subscribed to <strong style="color:#a78bfa;">ClaudeWire</strong> — the fastest way to stay updated on everything Anthropic and Claude.
              </p>

              <!-- What you'll get -->
              <div style="background:#0d0d14;border:1px solid #1f1f2e;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
                <p style="color:#6b7280;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 14px;">What you&apos;ll receive</p>
                ${[
                  ["🚀 Model Releases", "Instant alerts when Anthropic ships new Claude models"],
                  ["⚡ API Updates", "Breaking changes, new features, and performance boosts"],
                  ["🛡️ Safety Research", "Constitutional AI papers and alignment breakthroughs"],
                  ["💡 Product News", "Claude.ai features, Projects, and platform updates"],
                ].map(([title, desc]) => `
                  <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
                    <span style="font-size:16px;line-height:1;">${title.split(" ")[0]}</span>
                    <div>
                      <p style="color:#f1f0ff;font-size:13px;font-weight:600;margin:0 0 2px;">${title.slice(3)}</p>
                      <p style="color:#6b7280;font-size:12px;margin:0;">${desc}</p>
                    </div>
                  </div>
                `).join("")}
              </div>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:24px;">
                <a href="http://localhost:3000" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#8b5cf6);color:#ffffff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none;box-shadow:0 0 20px rgba(139,92,246,0.4);">
                  View Latest Updates →
                </a>
              </div>

              <p style="color:#4b5563;font-size:12px;text-align:center;margin:0;">
                You subscribed with <strong style="color:#6b7280;">${email}</strong>.<br/>
                To unsubscribe, reply to this email with "unsubscribe".
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1f1f2e;text-align:center;">
              <p style="color:#4b5563;font-size:11px;margin:0;">
                Sent by ClaudeWire · Powered by Resend
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
