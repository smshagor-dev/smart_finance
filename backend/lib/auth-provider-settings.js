import { prisma } from "./prisma.js";
import { decryptSecret, encryptSecret, isMaskedSecret, isValidRedirectValue, maskSecret, resolveSafeRedirect } from "./security.js";

export const SOCIAL_AUTH_PROVIDERS = ["google", "facebook", "telegram"];

const DEFAULT_SCOPES = {
  google: "openid email profile",
  facebook: "email,public_profile",
  telegram: "",
};

const PROVIDER_REQUIREMENTS = {
  google: ["clientId", "clientSecret", "callbackUrl", "successRedirectUrl", "failureRedirectUrl"],
  facebook: ["clientId", "clientSecret", "callbackUrl", "successRedirectUrl", "failureRedirectUrl"],
  telegram: ["botToken", "callbackUrl", "successRedirectUrl", "failureRedirectUrl"],
};

function normalizeRecord(record) {
  if (!record) {
    return null;
  }

  return {
    ...record,
    clientSecret: record.clientSecret ? decryptSecret(record.clientSecret) : "",
    botToken: record.botToken ? decryptSecret(record.botToken) : "",
    scopes: record.scopes || DEFAULT_SCOPES[record.provider] || "",
  };
}

export function hasRequiredProviderConfig(setting) {
  if (!setting) {
    return false;
  }

  const requirements = PROVIDER_REQUIREMENTS[setting.provider] || [];

  return requirements.every((field) => {
    const value = setting[field];
    if (!value || !String(value).trim()) {
      return false;
    }

    if (field.endsWith("Url")) {
      return isValidRedirectValue(String(value).trim());
    }

    return true;
  });
}

export function isProviderAvailable(setting) {
  return Boolean(setting?.isEnabled) && hasRequiredProviderConfig(setting);
}

export function toAdminProviderSetting(setting) {
  if (!setting) {
    return null;
  }

  return {
    ...setting,
    clientSecretMasked: maskSecret(setting.clientSecret),
    botTokenMasked: maskSecret(setting.botToken),
    clientSecret: undefined,
    botToken: undefined,
    computedSuccessRedirectUrl: resolveSafeRedirect(setting.successRedirectUrl),
    computedFailureRedirectUrl: resolveSafeRedirect(setting.failureRedirectUrl),
    hasRequiredConfig: hasRequiredProviderConfig(setting),
    isAvailable: isProviderAvailable(setting),
  };
}

export function toPublicProviderSetting(setting) {
  if (!setting) {
    return null;
  }

  return {
    provider: setting.provider,
    isEnabled: Boolean(setting.isEnabled),
    isAvailable: isProviderAvailable(setting),
  };
}

export async function getAllAuthProviderSettings() {
  const records = await prisma.authProviderSetting.findMany({
    orderBy: { provider: "asc" },
  });

  return SOCIAL_AUTH_PROVIDERS.map((provider) => normalizeRecord(records.find((record) => record.provider === provider)) || {
    id: "",
    provider,
    clientId: "",
    clientSecret: "",
    botToken: "",
    callbackUrl: "",
    successRedirectUrl: "",
    failureRedirectUrl: "",
    scopes: DEFAULT_SCOPES[provider] || "",
    configJson: null,
    isEnabled: false,
    createdAt: null,
    updatedAt: null,
  });
}

export async function getAuthProviderSetting(provider) {
  if (!SOCIAL_AUTH_PROVIDERS.includes(provider)) {
    throw new Error("Unsupported provider");
  }

  const record = await prisma.authProviderSetting.findUnique({
    where: { provider },
  });

  return normalizeRecord(record);
}

export async function saveAuthProviderSetting(provider, payload) {
  if (!SOCIAL_AUTH_PROVIDERS.includes(provider)) {
    throw new Error("Unsupported provider");
  }

  const existing = await getAuthProviderSetting(provider);
  const nextClientSecret =
    payload.clientSecret === undefined || payload.clientSecret === "" || isMaskedSecret(payload.clientSecret)
      ? existing?.clientSecret || ""
      : String(payload.clientSecret);
  const nextBotToken =
    payload.botToken === undefined || payload.botToken === "" || isMaskedSecret(payload.botToken)
      ? existing?.botToken || ""
      : String(payload.botToken);

  const saved = await prisma.authProviderSetting.upsert({
    where: { provider },
    update: {
      clientId: payload.clientId || null,
      clientSecret: nextClientSecret ? encryptSecret(nextClientSecret) : null,
      botToken: nextBotToken ? encryptSecret(nextBotToken) : null,
      callbackUrl: payload.callbackUrl || null,
      successRedirectUrl: payload.successRedirectUrl || null,
      failureRedirectUrl: payload.failureRedirectUrl || null,
      scopes: payload.scopes ?? DEFAULT_SCOPES[provider] ?? null,
      configJson: payload.configJson ?? null,
      isEnabled: Boolean(payload.isEnabled) && hasRequiredProviderConfig({
        provider,
        clientId: payload.clientId || "",
        clientSecret: nextClientSecret,
        botToken: nextBotToken,
        callbackUrl: payload.callbackUrl || "",
        successRedirectUrl: payload.successRedirectUrl || "",
        failureRedirectUrl: payload.failureRedirectUrl || "",
      }),
    },
    create: {
      provider,
      clientId: payload.clientId || null,
      clientSecret: nextClientSecret ? encryptSecret(nextClientSecret) : null,
      botToken: nextBotToken ? encryptSecret(nextBotToken) : null,
      callbackUrl: payload.callbackUrl || null,
      successRedirectUrl: payload.successRedirectUrl || null,
      failureRedirectUrl: payload.failureRedirectUrl || null,
      scopes: payload.scopes ?? DEFAULT_SCOPES[provider] ?? null,
      configJson: payload.configJson ?? null,
      isEnabled: Boolean(payload.isEnabled) && hasRequiredProviderConfig({
        provider,
        clientId: payload.clientId || "",
        clientSecret: nextClientSecret,
        botToken: nextBotToken,
        callbackUrl: payload.callbackUrl || "",
        successRedirectUrl: payload.successRedirectUrl || "",
        failureRedirectUrl: payload.failureRedirectUrl || "",
      }),
    },
  });

  return normalizeRecord(saved);
}
