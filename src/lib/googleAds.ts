import { splitFullName, normalizePhoneBR } from "./lead-utils";

export const GOOGLE_ADS_ID = "AW-18288202846";
export const GOOGLE_ADS_CONVERSION_LABEL = "hYv1CJ75juUcEN6ov5BE";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type NormalizedUserData = {
  phone_number: string;
  first_name: string;
  last_name: string;
};

/** Separa nome completo e formata telefone em E.164 (+55...). */
export function normalizeUserData(input: { nome: string; telefone: string }): NormalizedUserData {
  const { firstName, lastName } = splitFullName(input.nome);
  return {
    phone_number: normalizePhoneBR(input.telefone),
    first_name: firstName.toLowerCase(),
    last_name: lastName.toLowerCase(),
  };
}

export type LeadConversionInput = {
  transactionId: string;
  nome: string;
  telefone: string;
  value?: number;
  currency?: string;
};

/**
 * Dispara a conversão de lead no Google Ads com Enhanced Conversions.
 * Nunca lança: falha/ausência do gtag não pode afetar o fluxo do formulário.
 */
export function trackLeadConversion(input: LeadConversionInput): void {
  try {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;

    const user = normalizeUserData({ nome: input.nome, telefone: input.telefone });

    window.gtag("set", "user_data", {
      phone_number: user.phone_number,
      address: {
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });

    window.gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
      value: input.value ?? 1,
      currency: input.currency ?? "BRL",
      transaction_id: input.transactionId,
    });
  } catch (error) {
    console.warn("Falha ao registrar conversão do Google Ads:", error);
  }
}
