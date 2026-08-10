// server/services/whatsapp.service.js
import twilio from "twilio";

// Twilio client, created lazily so importing this module never fails at
// load time — credentials are read from the environment (dotenv is loaded
// first in index.js).
function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error("TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN are not set");
  }
  return twilio(sid, token);
}

export async function sendWhatsAppMessage({
  to,
  body,
  templateName = null,
  templateParams = [],
}) {
  const messageBody = {
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: formatWhatsApp(to),
  };

  if (templateName) {
    // Template message (production: pre-approved by Meta)
    messageBody.contentSid = templateName; // or use templateSid from Twilio
    messageBody.contentVariables = JSON.stringify(templateParams);
  } else {
    // Session message (sandbox: plain text within 24-hour window)
    messageBody.body = body;
  }

  const message = await getClient().messages.create(messageBody);
  return message;
}

export function formatWhatsApp(phone) {
  // Convert local format to E.164: "0701234567" -> "+254701234567"
  if (phone.startsWith("whatsapp:+")) return phone;
  if (phone.startsWith("+")) return `whatsapp:${phone}`;
  if (phone.startsWith("0")) {
    return `whatsapp:+254${phone.slice(1)}`;
  }
  return `whatsapp:+${phone}`;
}
