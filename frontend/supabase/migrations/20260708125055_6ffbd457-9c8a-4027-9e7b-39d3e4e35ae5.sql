
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'brand', 'creator');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Profiles (single table, role-specific fields nullable)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  phone text,
  country text,
  avatar_url text,
  bio text,
  approved boolean NOT NULL DEFAULT false,
  verified boolean NOT NULL DEFAULT false,
  -- creator fields
  niche text,
  audience_size integer,
  socials jsonb NOT NULL DEFAULT '{}'::jsonb,
  portfolio_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  payout_method text,
  payout_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  rate numeric,
  -- brand fields
  business_name text,
  contact_person text,
  website text,
  business_category text,
  company_size text,
  budget_range text,
  logo_url text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved creators" ON public.profiles FOR SELECT TO anon, authenticated
  USING (role = 'creator' AND approved = true);
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + role from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _role public.app_role;
BEGIN
  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'creator')::public.app_role;

  INSERT INTO public.profiles (id, role, email, full_name, phone, country, avatar_url,
    niche, audience_size, socials, portfolio_links, payout_method,
    business_name, contact_person, website, business_category, company_size, budget_range, logo_url, description,
    approved)
  VALUES (
    NEW.id,
    _role,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'niche',
    NULLIF(NEW.raw_user_meta_data->>'audience_size','')::int,
    COALESCE(NEW.raw_user_meta_data->'socials', '{}'::jsonb),
    COALESCE(NEW.raw_user_meta_data->'portfolio_links', '[]'::jsonb),
    NEW.raw_user_meta_data->>'payout_method',
    NEW.raw_user_meta_data->>'business_name',
    NEW.raw_user_meta_data->>'contact_person',
    NEW.raw_user_meta_data->>'website',
    NEW.raw_user_meta_data->>'business_category',
    NEW.raw_user_meta_data->>'company_size',
    NEW.raw_user_meta_data->>'budget_range',
    NEW.raw_user_meta_data->>'logo_url',
    NEW.raw_user_meta_data->>'description',
    -- creators auto-approved for beta so they show in pool; admin can toggle
    true
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
    ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
