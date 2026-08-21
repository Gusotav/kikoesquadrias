import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/retry-leads")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = request.headers.get("apikey");
        const allowed = [
          process.env["SUPABASE_ANON_KEY"],
          process.env["SUPABASE_PUBLISHABLE_KEY"],
        ].filter((v): v is string => !!v);
        const expected = allowed.length > 0;


        if (!expected || !apiKey || !allowed.includes(apiKey)) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: rows, error } = await supabaseAdmin
          .from("leads")
          .select("*")
          .in("status", ["pending", "failed"])
          .lt("attempts", 10)
          .order("created_at", { ascending: true })
          .limit(25);

        if (error) {
          console.error("Retry: falha ao ler leads:", error.message);
          return new Response(JSON.stringify({ error: "db_error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const { deliverLead } = await import("@/lib/ghl.server");
        let sent = 0;
        for (const row of rows ?? []) {
          if (await deliverLead(row)) sent += 1;
        }

        return new Response(
          JSON.stringify({ processed: rows?.length ?? 0, sent }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
