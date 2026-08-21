import { splitFullName, normalizePhoneBR } from "./lead-utils";

export const FB_PIXEL_ID = "1954080931970920";

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      queue?: unknown[];
      callMethod?: (...args: unknown[]) => void;
      push?: unknown;
      loaded?: boolean;
      version?: string;
    };
    _fbq?: unknown;
    _fbPixelInitialized?: boolean;
  }
}

/** Inicializa o Meta Pixel no browser. Idempotente (safe em HMR). */
export function initPixel(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window._fbPixelInitialized) return;

  try {
    if (!window.fbq) {
      const fbq = function (...args: unknown[]) {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue?.push(args);
      } as NonNullable<Window["fbq"]>;
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.push = fbq;
      window.fbq = fbq;
      window._fbq = window._fbq || fbq;

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
    }

    window.fbq?.("init", FB_PIXEL_ID);
    // Desativa auto-track de pushState/hash em SPA
    window.fbq?.("set", "autoConfig", false, FB_PIXEL_ID);
    window._fbPixelInitialized = true;
  } catch (error) {
    console.warn("Falha ao inicializar o Meta Pixel:", error);
  }
}

/** Lê os cookies _fbc e _fbp do browser. */
export function getFbcFbp(): { fbc: string; fbp: string } {
  if (typeof document === "undefined") return { fbc: "", fbp: "" };
  const read = (name: string) => {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match?.[1] ? decodeURIComponent(match[1]) : "";
  };
  return { fbc: read("_fbc"), fbp: read("_fbp") };
}

function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fallback abaixo */
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Dispara um evento no Meta Pixel com eventID (deduplicação).
 * Nunca lança: falha do pixel não pode afetar o fluxo da UI.
 */
export function trackWebEvent(
  name: string,
  customData?: Record<string, unknown>,
  eventID?: string,
): string {
  const id = eventID ?? randomId();
  try {
    if (typeof window === "undefined" || typeof window.fbq !== "function") return id;
    window.fbq("track", name, customData ?? {}, { eventID: id });
  } catch (error) {
    console.warn("Falha ao registrar evento do Meta Pixel:", error);
  }
  return id;
}

/** Reinicializa o pixel com advanced matching a partir dos dados do lead. */
export function setAdvancedMatching(input: { nome: string; telefone: string }): void {
  try {
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;
    const { firstName, lastName } = splitFullName(input.nome);
    window.fbq("init", FB_PIXEL_ID, {
      fn: firstName.toLowerCase(),
      ln: lastName.toLowerCase(),
      ph: normalizePhoneBR(input.telefone),
    });
  } catch (error) {
    console.warn("Falha ao definir advanced matching do Meta Pixel:", error);
  }
}
