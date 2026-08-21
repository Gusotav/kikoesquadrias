import { splitFullName, normalizePhoneBR } from "./lead-utils";

const GHL_ENDPOINT = "https://services.leadconnectorhq.com/contacts/upsert";
const LOCATION_ID = "AB4y5smAgYubQUzicLFT";

const FIELD_IDS = {
  perfil: "Qr0RLhApLHfSvlKk38aG",
  utm_source: "7uyCQyseTuw64nVOtpLP",
  utm_medium: "N7y9PIY9uUHZG1gZhfHj",
  utm_campaign: "GGfzLodO2rLkSY1KMzdv",
  utm_content: "CT2CmdIcbZSXM4I4Nyf1",
  utm_term: "7qmzR9LGk89VaetVhRZ7",
  page_referrer: "FYvioc9btzUFiKcjSakD",
  url_conversao: "rXZ4U7IEjCJx1AEdpyNm",
} as const;

export type LeadRow = {
  id: string;
  nome: string;
  telefone: string;
  perfil: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  page_referrer: string | null;
  url_conversao: string | null;
  attempts?: number | null;
};

/** Envia o lead para o GoHighLevel. Lança erro quando a API responde fora de 2xx. */
export async function sendLeadToGHL(lead: LeadRow): Promise<void> {
  const token = process.env["GHL_TOKEN"];
  if (!token) throw new Error("GHL_TOKEN não configurado");

  const { firstName, lastName } = splitFullName(lead.nome);
  const v = (value: string | null | undefined) => value ?? "";

  const payload = {
    locationId: LOCATION_ID,
    firstName,
    lastName,
    phone: normalizePhoneBR(lead.telefone),
    tags: [v(lead.utm_source), v(lead.utm_campaign)].filter(Boolean),
    customFields: [
      { id: FIELD_IDS.perfil, field_value: v(lead.perfil) },
      { id: FIELD_IDS.utm_source, field_value: v(lead.utm_source) },
      { id: FIELD_IDS.utm_medium, field_value: v(lead.utm_medium) },
      { id: FIELD_IDS.utm_campaign, field_value: v(lead.utm_campaign) },
      { id: FIELD_IDS.utm_content, field_value: v(lead.utm_content) },
      { id: FIELD_IDS.utm_term, field_value: v(lead.utm_term) },
      { id: FIELD_IDS.page_referrer, field_value: v(lead.page_referrer) },
      { id: FIELD_IDS.url_conversao, field_value: v(lead.url_conversao) },
    ],
    source: "Lead LP Lovable",
  };

  const response = await fetch(GHL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Version: "2021-07-28",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GoHighLevel falhou [${response.status}]: ${body.slice(0, 500)}`);
  }
}

/** Tenta enviar e atualiza o status da linha em `leads`. Retorna true no sucesso. */
export async function deliverLead(lead: LeadRow): Promise<boolean> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const attempts = (lead.attempts ?? 0) + 1;

  try {
    await sendLeadToGHL(lead);
    await supabaseAdmin
      .from("leads")
      .update({ status: "sent", sent_at: new Date().toISOString(), attempts, last_error: null })
      .eq("id", lead.id);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Falha ao enviar lead para o GoHighLevel:", message);
    await supabaseAdmin
      .from("leads")
      .update({ status: "failed", attempts, last_error: message.slice(0, 1000) })
      .eq("id", lead.id);
    return false;
  }
}
