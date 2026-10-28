import axios from 'axios';

export interface SmsDispatchResult {
  success: boolean;
  provider: string;
  messageSid?: string;
  errorMessage?: string;
}

export interface OtpVerifyResult {
  success: boolean;
  status?: string;
  errorMessage?: string;
}

// Cache auto-discovered or auto-created Verify Service SID (VA...) in memory
let cachedVerifyServiceSid: string | null = null;

/**
 * Normalise an Indian mobile number to E.164 format (+91XXXXXXXXXX).
 */
export function normaliseIndianPhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-().]/g, '');
  const match = cleaned.match(/^(?:\+?91|0)?([6-9]\d{9})$/);
  if (!match) return null;
  return `+91${match[1]}`;
}

/**
 * Resolve Twilio credentials (supports both Account SID "AC..." and API Key SID "SK...").
 */
function getTwilioCredentials(): {
  configured: boolean;
  sid: string;
  secret: string;
  configuredServiceSid: string;
} {
  const sid = (
    process.env.TWILIO_ACCOUNT_SID ||
    process.env.TWILIO_API_KEY_SID ||
    ''
  ).trim();
  const secret = (
    process.env.TWILIO_AUTH_TOKEN ||
    process.env.TWILIO_API_KEY_SECRET ||
    ''
  ).trim();
  const configuredServiceSid = (process.env.TWILIO_VERIFY_SERVICE_SID || '').trim();

  const configured =
    Boolean(sid) &&
    Boolean(secret) &&
    !sid.startsWith('your_') &&
    !sid.startsWith('YOUR_') &&
    !secret.startsWith('your_') &&
    !secret.startsWith('YOUR_') &&
    (sid.startsWith('AC') || sid.startsWith('SK'));

  return { configured, sid, secret, configuredServiceSid };
}

/**
 * Automatically discover an existing Twilio Verify Service (VA...) or create one
 * if the user only provided two Twilio keys (SID + Secret).
 */
async function resolveVerifyServiceSid(
  basicAuth: string,
  configuredServiceSid: string
): Promise<string | null> {
  if (configuredServiceSid.startsWith('VA')) {
    return configuredServiceSid;
  }
  if (cachedVerifyServiceSid) {
    return cachedVerifyServiceSid;
  }

  const headers = {
    Authorization: `Basic ${basicAuth}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  try {
    // 1. Check if a Verify Service already exists on the Twilio account
    const listResp = await axios.get(
      'https://verify.twilio.com/v2/Services?PageSize=5',
      { headers, timeout: 10000 }
    );
    const services = listResp.data?.services;
    if (Array.isArray(services) && services.length > 0 && services[0]?.sid) {
      cachedVerifyServiceSid = services[0].sid;
      return cachedVerifyServiceSid;
    }

    // 2. Otherwise create a new Verify Service automatically
    const createBody = new URLSearchParams({
      FriendlyName: 'SmartHealth NE',
      CodeLength: '6'
    });
    const createResp = await axios.post(
      'https://verify.twilio.com/v2/Services',
      createBody.toString(),
      { headers, timeout: 10000 }
    );
    if (createResp.data?.sid) {
      cachedVerifyServiceSid = createResp.data.sid;
      return cachedVerifyServiceSid;
    }
  } catch (err: any) {
    console.warn(
      '[Twilio Verify] Could not auto-resolve Verify Service SID:',
      err?.response?.data?.message || err?.message
    );
  }

  return null;
}

/**
 * Attempt to dispatch an SMS OTP via Twilio Verify v2 REST API.
 */
export async function sendVerifyOtp(toE164: string): Promise<SmsDispatchResult> {
  const creds = getTwilioCredentials();
  if (!creds.configured) {
    return {
      success: false,
      provider: 'twilio-verify',
      errorMessage: 'Twilio credentials are not configured.'
    };
  }

  const basicAuth = Buffer.from(`${creds.sid}:${creds.secret}`).toString('base64');
  const serviceSid = await resolveVerifyServiceSid(basicAuth, creds.configuredServiceSid);

  if (!serviceSid) {
    return {
      success: false,
      provider: 'twilio-verify',
      errorMessage:
        'Twilio API Key (SK...) requires a parent Account SID (AC...) or a Verify Service SID (VA...).'
    };
  }

  const url = `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`;
  const body = new URLSearchParams({
    To: toE164,
    Channel: 'sms'
  });

  try {
    const response = await axios.post(url, body.toString(), {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 12000
    });

    return {
      success: true,
      provider: 'twilio-verify',
      messageSid: response.data?.sid
    };
  } catch (err: any) {
    const twilioMessage =
      err?.response?.data?.message ||
      err?.message ||
      'Twilio Verify SMS dispatch failed.';
    return {
      success: false,
      provider: 'twilio-verify',
      errorMessage: twilioMessage
    };
  }
}

/**
 * Check a user-supplied OTP code via Twilio Verify v2 REST API.
 */
export async function checkVerifyOtp(toE164: string, code: string): Promise<OtpVerifyResult> {
  const creds = getTwilioCredentials();
  if (!creds.configured) {
    return {
      success: false,
      errorMessage: 'Twilio credentials are not configured.'
    };
  }

  const basicAuth = Buffer.from(`${creds.sid}:${creds.secret}`).toString('base64');
  const serviceSid = await resolveVerifyServiceSid(basicAuth, creds.configuredServiceSid);

  if (!serviceSid) {
    return {
      success: false,
      errorMessage: 'Verify Service SID could not be resolved.'
    };
  }

  const url = `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`;
  const body = new URLSearchParams({
    To: toE164,
    Code: code.trim()
  });

  try {
    const response = await axios.post(url, body.toString(), {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 12000
    });

    const status = response.data?.status;
    if (status === 'approved') {
      return { success: true, status };
    }
    return {
      success: false,
      status,
      errorMessage: 'Invalid or expired OTP code.'
    };
  } catch (err: any) {
    const twilioMessage =
      err?.response?.data?.message ||
      err?.message ||
      'OTP verification check failed.';
    return {
      success: false,
      errorMessage: twilioMessage
    };
  }
}
