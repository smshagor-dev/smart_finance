function wrapTemplate({ siteName, logoUrl, title, intro, contentLines, footer }) {
  const contentHtml = contentLines.map((line) => `<p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.7;">${line}</p>`).join("");

  return `
    <div style="margin:0;padding:24px;background:#f4f7f2;font-family:Segoe UI,Arial,sans-serif;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #d7dfd0;border-radius:24px;overflow:hidden;">
        <div style="padding:28px 32px;background:linear-gradient(180deg,#102318 0%,#173122 100%);color:#ffffff;">
          ${logoUrl ? `<img src="${logoUrl}" alt="${siteName}" style="height:48px;width:auto;max-width:180px;display:block;margin-bottom:12px;" />` : ""}
          <div style="font-size:12px;letter-spacing:0.28em;text-transform:uppercase;opacity:0.7;">${siteName}</div>
          <h1 style="margin:16px 0 0;font-size:30px;line-height:1.2;">${title}</h1>
          <p style="margin:12px 0 0;color:rgba(255,255,255,0.78);font-size:15px;line-height:1.7;">${intro}</p>
        </div>
        <div style="padding:32px;">
          ${contentHtml}
          <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e2e8f0;color:#64748b;font-size:13px;line-height:1.6;">
            ${footer}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function buildVerificationEmail({ name, code, expiryMinutes = 15, siteSettings }) {
  const safeName = name || "there";
  const siteName = siteSettings?.siteName || "Finance Tracker";
  const logoUrl = siteSettings?.logoUrl || "";
  const supportEmail = siteSettings?.supportEmail || "support";

  return {
    subject: `Verify your ${siteName} email`,
    text: `Hi ${safeName}, your ${siteName} verification code is ${code}. This code expires in ${expiryMinutes} minutes.`,
    html: wrapTemplate({
      siteName,
      logoUrl,
      title: "Verify your email",
      intro: `Hi ${safeName}, use the verification code below to activate your ${siteName} account.`,
      contentLines: [
        `Your 6-digit verification code is:`,
        `<span style="display:inline-block;margin:6px 0 16px;padding:14px 18px;border-radius:16px;background:#eff6ef;border:1px solid #d7dfd0;color:#102318;font-size:32px;font-weight:700;letter-spacing:0.35em;">${code}</span>`,
        `This code will expire in ${expiryMinutes} minutes.`,
        `If you did not request this account, you can safely ignore this email.`,
      ],
      footer: `For your security, never share this code with anyone.${supportEmail ? ` Need help? Contact ${supportEmail}.` : ""}`,
    }),
  };
}
