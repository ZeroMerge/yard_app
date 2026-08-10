
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  author_name TEXT NOT NULL DEFAULT 'CreatorYard',
  tags TEXT[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Public can read published posts"
ON public.blog_posts FOR SELECT
USING (published = true);

-- Authenticated can read all (drafts included)
CREATE POLICY "Authenticated can read all posts"
ON public.blog_posts FOR SELECT
TO authenticated
USING (true);

-- Authenticated can write (demo: any signed-in user can manage; refine when roles land)
CREATE POLICY "Authenticated can insert posts"
ON public.blog_posts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update posts"
ON public.blog_posts FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete posts"
ON public.blog_posts FOR DELETE
TO authenticated
USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed a few starter posts
INSERT INTO public.blog_posts (slug, title, excerpt, content, author_name, tags, published, published_at) VALUES
('welcome-to-creatoryard', 'Welcome to CreatorYard', 'Why we''re building the operating system for African creator marketing.', 'CreatorYard helps brands run creator campaigns end to end — discovery, briefs, approvals, payouts. This is our first note.\n\nWe believe African brands deserve a workflow-first tool, not another marketplace.', 'The CreatorYard Team', ARRAY['product','launch'], true, now() - interval '10 days'),
('paying-creators-fairly', 'Paying creators fairly, without the friction', 'How our escrow-style payouts protect both brands and creators.', 'Every payout flows through a clear lifecycle: requested → approved → paid. Fees are transparent. Refunds are automatic when a payout fails or is cancelled.\n\nNo more chasing invoices in DMs.', 'Ada Nnadi', ARRAY['payments','trust'], true, now() - interval '5 days'),
('brief-that-converts', 'The brief that converts', 'Five things every great creator brief includes.', '1. A single, sharp objective.\n2. Non-negotiables and creative freedom, clearly separated.\n3. Reference material — not a script.\n4. Deliverables with formats and dates.\n5. Payment terms up front.', 'Tunde Bakare', ARRAY['playbook','briefs'], true, now() - interval '1 day');
