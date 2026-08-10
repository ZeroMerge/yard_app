
DROP POLICY IF EXISTS "Authenticated can insert posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated can delete posts" ON public.blog_posts;

GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO anon;

CREATE POLICY "Demo: anyone can insert posts" ON public.blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Demo: anyone can update posts" ON public.blog_posts FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Demo: anyone can delete posts" ON public.blog_posts FOR DELETE USING (true);
