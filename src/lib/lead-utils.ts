import { z } from "zod";

/* ----------------------------- Telefone BR ----------------------------- */

/** Aplica máscara progressiva (99) 99999-9999 */
export function maskPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Remove máscara e adiciona prefixo internacional +55 */
export function normalizePhoneBR(value: string): string {
  const digits = value.replace(/\D/g, "");
  const local = digits.startsWith("55") && digits.length > 11 ? digits.slice(2) : digits;
  return `+55${local}`;
}

/* ----------------------------- Nome ----------------------------- */

export function splitFullName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  const [first, ...rest] = parts;
  return { firstName: first ?? "", lastName: rest.join(" ") };
}

/* ----------------------------- UTMs ----------------------------- */

export type UtmData = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  gad_source: string;
  gclid: string;
  page_referrer: string;
  url_conversao: string;
};

const EMPTY_UTM: UtmData = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  utm_term: "",
  gad_source: "",
  gclid: "",
  page_referrer: "",
  url_conversao: "",
};

/** Extrai UTMs, identificadores de anúncio, referrer e URL completa (browser-only). */
export function getUtmData(): UtmData {
  if (typeof window === "undefined") return { ...EMPTY_UTM };

  const params = new URLSearchParams(window.location.search);
  const get = (key: string) => (params.get(key) ?? "").trim();

  const gclid = get("gclid");
  const gadSource = get("gad_source");
  const gbraid = get("gbraid");
  const wbraid = get("wbraid");

  let utmSource = get("utm_source");
  let utmMedium = get("utm_medium");

  // page_referrer: vazio quando o referrer é do próprio domínio
  let pageReferrer = "";
  let referrerHost = "";
  const rawReferrer = typeof document !== "undefined" ? document.referrer : "";
  if (rawReferrer) {
    try {
      const url = new URL(rawReferrer);
      if (url.hostname !== window.location.hostname) {
        pageReferrer = rawReferrer;
        referrerHost = url.hostname;
      }
    } catch {
      /* referrer inválido → ignora */
    }
  }

  if (!utmSource) {
    if (gclid || gadSource || gbraid || wbraid) {
      utmSource = "google";
      utmMedium = "cpc";
    } else if (referrerHost) {
      utmSource = referrerHost;
    } else {
      utmSource = "direct";
      utmMedium = utmMedium || "none";
    }
  }

  return {
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: get("utm_campaign"),
    utm_content: get("utm_content"),
    utm_term: get("utm_term"),
    gad_source: gadSource,
    gclid,
    page_referrer: pageReferrer,
    url_conversao: window.location.href,
  };
}

/* ----------------------------- Validação ----------------------------- */

export const leadSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(2, { message: "Informe seu nome completo." })
    .max(120, { message: "Nome muito longo." }),
  telefone: z
    .string()
    .trim()
    .refine((v) => {
      const d = v.replace(/\D/g, "");
      return d.length === 10 || d.length === 11;
    }, { message: "Informe um WhatsApp válido com DDD." }),
  perfil: z.string().trim().max(60).optional().default(""),
  utm_source: z.string().max(300).optional().default(""),
  utm_medium: z.string().max(300).optional().default(""),
  utm_campaign: z.string().max(300).optional().default(""),
  utm_content: z.string().max(300).optional().default(""),
  utm_term: z.string().max(300).optional().default(""),
  page_referrer: z.string().max(1000).optional().default(""),
  url_conversao: z.string().max(1000).optional().default(""),
});

export type LeadInput = z.infer<typeof leadSchema>;
