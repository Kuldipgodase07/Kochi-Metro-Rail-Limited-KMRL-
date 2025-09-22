import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM_SMS,
  TWILIO_FROM_WHATSAPP, // e.g. 'whatsapp:+14155238886' for sandbox
  TWILIO_VOICE_CALLERID, // Twilio phone number for voice calls
  NOTIFY_SMS_LIST, // comma-separated E.164 numbers e.g. '+9198..., +1202...'
  NOTIFY_WHATSAPP_LIST, // comma-separated numbers e.g. '+9198...'
  NOTIFY_VOICE_LIST // comma-separated numbers e.g. '+9198...'
} = process.env;

let client = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

const parseList = (val, mapFn = (x) => x) => (val ? val.split(',').map(s => mapFn(s.trim())).filter(Boolean) : []);

const defaultSmsRecipients = parseList(NOTIFY_SMS_LIST);
const defaultWaRecipients = parseList(NOTIFY_WHATSAPP_LIST, n => (n.startsWith('whatsapp:') ? n : `whatsapp:${n}`));
const defaultVoiceRecipients = parseList(NOTIFY_VOICE_LIST);

export const sendSMS = async (to, body) => {
  if (!client || !TWILIO_FROM_SMS) throw new Error('Twilio SMS not configured');
  return client.messages.create({ from: TWILIO_FROM_SMS, to, body });
};

export const sendWhatsApp = async (to, body) => {
  if (!client || !TWILIO_FROM_WHATSAPP) throw new Error('Twilio WhatsApp not configured');
  const toAddr = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  return client.messages.create({ from: TWILIO_FROM_WHATSAPP, to: toAddr, body });
};

export const makeVoiceCall = async (to, message) => {
  if (!client || !TWILIO_VOICE_CALLERID) throw new Error('Twilio Voice not configured');
  // Use TwiML via inline 'twiml' param for a simple TTS call
  const twiml = `<Response><Say voice="Polly.Joanna">${message}</Say></Response>`;
  return client.calls.create({ from: TWILIO_VOICE_CALLERID, to, twiml });
};

// Notification policy per severity
// minor -> WhatsApp
// major -> SMS + WhatsApp
// critical -> SMS + WhatsApp + Voice
export const notifyIncident = async ({ message, severity, recipients = {} }) => {
  const results = { sms: [], whatsapp: [], voice: [], errors: [] };
  const smsList = recipients.sms?.length ? recipients.sms : defaultSmsRecipients;
  const waList = recipients.whatsapp?.length ? recipients.whatsapp : defaultWaRecipients;
  const voiceList = recipients.voice?.length ? recipients.voice : defaultVoiceRecipients;

  const promises = [];
  const safePush = (arr, p) => promises.push(p.then(r => arr.push(r)).catch(e => results.errors.push(e?.message || String(e))));

  if (severity === 'minor') {
    waList.forEach(n => safePush(results.whatsapp, sendWhatsApp(n, message)));
  } else if (severity === 'major') {
    waList.forEach(n => safePush(results.whatsapp, sendWhatsApp(n, message)));
    smsList.forEach(n => safePush(results.sms, sendSMS(n, message)));
  } else if (severity === 'critical') {
    waList.forEach(n => safePush(results.whatsapp, sendWhatsApp(n, message)));
    smsList.forEach(n => safePush(results.sms, sendSMS(n, message)));
    voiceList.forEach(n => safePush(results.voice, makeVoiceCall(n, message)));
  }

  await Promise.all(promises);
  return results;
};

export const isTwilioConfigured = () => Boolean(client);
