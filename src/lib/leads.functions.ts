import { createServerFn } from "@tanstack/react-start";

import { leadSchema } from "./lead-utils";

export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => leadSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("leads")
      .insert({
        status: "pending",
        nome: data.nome,
        telefone: data.telefone,
        perfil: data.perfil ?? "",
        utm_source: data.utm_source ?? "",
        utm_medium: data.utm_medium ?? "",
        utm_campaign: data.utm_campaign ?? "",
        utm_content: data.utm_content ?? "",
        utm_term: data.utm_term ?? "",
        page_referrer: data.page_referrer ?? "",
        url_conversao: data.url_conversao ?? "",
      })
      .select("*")
      .single();

    if (error || !row) {
      console.error("Falha ao gravar lead:", error?.message);
      throw new Error("Não foi possível registrar o contato.");
    }

    const { deliverLead } = await import("./ghl.server");
    const delivered = await deliverLead(row);

    return { ok: true, delivered };
  });
