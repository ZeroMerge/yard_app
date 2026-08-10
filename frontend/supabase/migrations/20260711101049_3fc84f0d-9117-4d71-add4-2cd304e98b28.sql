
DROP POLICY IF EXISTS "Demo: anyone can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Demo: anyone can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Demo: anyone can delete posts" ON public.blog_posts;
REVOKE INSERT, UPDATE, DELETE ON public.blog_posts FROM anon;

CREATE POLICY "Admins can insert posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update posts" ON public.blog_posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete posts" ON public.blog_posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Public can view approved creators" ON public.profiles;
REVOKE SELECT ON public.profiles FROM anon;

CREATE OR REPLACE VIEW public.public_creators WITH (security_invoker = true) AS
SELECT id, role, full_name, country, avatar_url, bio, niche, audience_size, portfolio_links, verified, approved, created_at
FROM public.profiles
WHERE role = 'creator' AND approved = true;
GRANT SELECT ON public.public_creators TO anon, authenticated;

CREATE POLICY "Public directory reads approved creators" ON public.profiles FOR SELECT TO anon, authenticated USING (role = 'creator' AND approved = true);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _requested text; _role public.app_role;
BEGIN
  _requested := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'creator');
  IF _requested NOT IN ('brand', 'creator') THEN _requested := 'creator'; END IF;
  _role := _requested::public.app_role;

  INSERT INTO public.profiles (id, role, email, full_name, phone, country, avatar_url,
    niche, audience_size, socials, portfolio_links, payout_method,
    business_name, contact_person, website, business_category, company_size, budget_range, logo_url, description,
    approved)
  VALUES (
    NEW.id, _role, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'country', NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'niche', NULLIF(NEW.raw_user_meta_data->>'audience_size','')::int,
    COALESCE(NEW.raw_user_meta_data->'socials', '{}'::jsonb),
    COALESCE(NEW.raw_user_meta_data->'portfolio_links', '[]'::jsonb),
    NEW.raw_user_meta_data->>'payout_method',
    NEW.raw_user_meta_data->>'business_name', NEW.raw_user_meta_data->>'contact_person',
    NEW.raw_user_meta_data->>'website', NEW.raw_user_meta_data->>'business_category',
    NEW.raw_user_meta_data->>'company_size', NEW.raw_user_meta_data->>'budget_range',
    NEW.raw_user_meta_data->>'logo_url', NEW.raw_user_meta_data->>'description',
    false
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role) ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

ALTER TABLE public.profiles ALTER COLUMN approved SET DEFAULT false;

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND approved = (SELECT approved FROM public.profiles WHERE id = auth.uid())
    AND verified = (SELECT verified FROM public.profiles WHERE id = auth.uid())
  );
