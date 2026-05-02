import nodemailer from "nodemailer";
import { getResolvedSmtpSettings } from "@/lib/site-settings";

async function getSmtpConfig() {
  const { host, port, secure, user, pass, from } = await getResolvedSmtpSettings();

  if (!host || !user || !pass || !from) {
    throw new Error("SMTP configuration is incomplete");
  }

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    from,
  };
}

export async function sendMail({ to, subject, html, text }) {
  const config = await getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject,
    html,
    text,
  });
}
