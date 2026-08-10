
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_platform text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _requested text; _role public.app_role;
BEGIN
  _requested := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'creator');
  IF _requested NOT IN ('brand', 'creator') THEN _requested := 'creator'; END IF;
  _role := _requested::public.app_role;

  INSERT INTO public.profiles (id, role, email, full_name, phone, country, city, avatar_url,
    niche, primary_platform, audience_size, socials, portfolio_links, payout_method,
    business_name, contact_person, website, business_category, company_size, budget_range, logo_url, description,
    approved)
  VALUES (
    NEW.id, _role, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'niche',
    NEW.raw_user_meta_data->>'primary_platform',
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
    false
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role) ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
