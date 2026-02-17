// /lib/aisensy.ts

export interface SendWhatsAppOTPExactOptions {
  apiKey?: string;
  campaignName?: string;
  userName?: string;
  phone10: string;
  otp: string;
  source?: string;
  urlButtonParam?: string;
}

type AiSensyResponse = {
  success?: boolean;
  status?: string;
  message?: string;
  [key: string]: any;
};

function toE164India(phone10: string) {
  const digits = phone10.replace(/\D/g, "");
  if (digits.length < 10) throw new Error("Invalid phone number");
  return `91${digits.slice(-10)}`; // example: 919876543210
}

export async function sendWhatsAppOTPExact({
  apiKey = process.env.AISENSY_API_KEY,
  campaignName = process.env.AISENSY_CAMPAIGN_NAME,
  userName = process.env.AISENSY_USERNAME,
  phone10,
  otp,
  source = "icfr-webapp",
  urlButtonParam,
}: SendWhatsAppOTPExactOptions) {
  if (!apiKey) throw new Error("AISENSY_API_KEY missing in environment");
  if (!campaignName)
    throw new Error("AISENSY_CAMPAIGN_NAME missing in environment");
  if (!userName) throw new Error("AISENSY_USERNAME missing in environment");

  const destination = toE164India(phone10);

  // ✅ Correct payload: apiKey must be inside payload (NOT bearer header)
  const payload = {
    apiKey,
    campaignName,
    destination,
    userName,
    templateParams: [otp],
    source,
    ...(urlButtonParam
      ? {
          buttons: [
            {
              type: "button" as const,
              sub_type: "url" as const,
              index: 0,
              parameters: [
                {
                  type: "text" as const,
                  text: urlButtonParam,
                },
              ],
            },
          ],
        }
      : {}),
  };

  const url = "https://backend.aisensy.com/campaign/t1/api/v2";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // ❌ remove Authorization header
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await res.text();
  let data: AiSensyResponse | string = text;

  try {
    data = JSON.parse(text) as AiSensyResponse;
  } catch {
    // non-json response will remain as string
  }

  // ✅ extra safety: check API-level success too
  if (
    !res.ok ||
    (typeof data === "object" &&
      (data.success === false || data.status === "error"))
  ) {
    console.error("AiSensy OTP SEND ERROR", {
      http: res.status,
      url,
      payload,
      response: data,
    });

    throw new Error(
      `AiSensy send failed: HTTP ${res.status} ${
        typeof data === "string" ? data : JSON.stringify(data)
      }`,
    );
  }

  console.log("✅ AiSensy OTP SENT", data);
  return data;
}
