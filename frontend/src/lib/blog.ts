import { supabase } from "@/integrations/supabase/client";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  author_name: string;
  tags: string[];
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function listPosts(includeDrafts = false): Promise<BlogPost[]> {
  let q = supabase.from("blog_posts").select("*").order("published_at", { ascending: false, nullsFirst: false });
  if (!includeDrafts) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return (data as BlogPost | null) ?? null;
}

export async function upsertPost(p: Partial<BlogPost> & { title: string; slug: string; content: string }) {
  const payload = {
    ...p,
    published_at: p.published && !p.published_at ? new Date().toISOString() : p.published_at ?? null,
  };
  const { data, error } = await supabase.from("blog_posts").upsert(payload, { onConflict: "slug" }).select().single();
  if (error) throw error;
  return data as BlogPost;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}
