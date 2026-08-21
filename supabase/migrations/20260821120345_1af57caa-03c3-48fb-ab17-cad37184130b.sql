CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending',
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  perfil TEXT,
  utm_source TEXT DEFAULT '',
  utm_medium TEXT DEFAULT '',
  utm_campaign TEXT DEFAULT '',
  utm_content TEXT DEFAULT '',
  utm_term TEXT DEFAULT '',
  url_conversao TEXT DEFAULT '',
  page_referrer TEXT DEFAULT '',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE INDEX leads_status_created_at_idx ON public.leads (status, created_at);