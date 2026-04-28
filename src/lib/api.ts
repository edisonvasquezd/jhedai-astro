const API = "https://jhedai-api.edison-985.workers.dev";

// --- Interfaces ---

export interface Author {
  name: string;
  avatar?: string;
  bio?: string;
  twitter?: string;
  linkedin?: string;
  type: string;
  jobTitle?: string;
  url?: string;
  sameAs: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: Author;
  publishedAt: string;
  updatedAt: string;
  readTime: string;
  featured: boolean;
  featuredImage?: string;
  featuredImageAlt?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  canonicalUrl?: string;
  schemaType?: string;
  focusKeyword?: string;
  faqItems: FAQItem[];
  keyTakeaways: string[];
  wordCount: number;
  primaryAnswer?: string;
  speakableSelectors: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
}

// --- Normalizer ---

function normalizePost(raw: Record<string, unknown>): BlogPost {
  const rawAuthor = raw.author as Record<string, unknown> | undefined;
  return {
    id: raw.id as number,
    slug: raw.slug as string,
    title: raw.title as string,
    excerpt: (raw.excerpt as string) || "",
    content: (raw.content as string) || "",
    category: (raw.category as string) || "",
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    author: {
      name: (rawAuthor?.name as string) || (raw.author_name as string) || "JhedAI",
      avatar: (rawAuthor?.avatar as string) || (raw.author_avatar as string) || undefined,
      bio: (rawAuthor?.bio as string) || (raw.author_bio as string) || undefined,
      twitter: (rawAuthor?.twitter as string) || (raw.author_twitter as string) || undefined,
      linkedin: (rawAuthor?.linkedin as string) || (raw.author_linkedin as string) || undefined,
      type: (rawAuthor?.type as string) || "Organization",
      jobTitle: (rawAuthor?.jobTitle as string) || undefined,
      url: (rawAuthor?.url as string) || undefined,
      sameAs: Array.isArray(rawAuthor?.sameAs) ? (rawAuthor.sameAs as string[]) : [],
    },
    publishedAt: (raw.published_at as string) || (raw.publishedAt as string) || "",
    updatedAt: (raw.updated_at as string) || (raw.updatedAt as string) || "",
    readTime: (raw.read_time as string) || (raw.readTime as string) || "5 min",
    featured: raw.featured === true || raw.featured === 1,
    featuredImage: (raw.featured_image as string) || (raw.featuredImage as string) || undefined,
    featuredImageAlt: (raw.featured_image_alt as string) || (raw.featuredImageAlt as string) || undefined,
    metaTitle: (raw.meta_title as string) || (raw.metaTitle as string) || undefined,
    metaDescription: (raw.meta_description as string) || (raw.metaDescription as string) || undefined,
    ogTitle: (raw.og_title as string) || undefined,
    ogDescription: (raw.og_description as string) || undefined,
    ogImage: (raw.og_image as string) || undefined,
    twitterTitle: (raw.twitter_title as string) || undefined,
    twitterDescription: (raw.twitter_description as string) || undefined,
    canonicalUrl: (raw.canonical_url as string) || undefined,
    schemaType: (raw.schema_type as string) || undefined,
    focusKeyword: (raw.focus_keyword as string) || undefined,
    faqItems: Array.isArray(raw.faq_items) ? (raw.faq_items as FAQItem[]) : [],
    keyTakeaways: Array.isArray(raw.key_takeaways) ? (raw.key_takeaways as string[]) : [],
    wordCount: (raw.word_count as number) || 0,
    primaryAnswer: (raw.primary_answer as string) || undefined,
    speakableSelectors: Array.isArray(raw.speakable_selectors)
      ? (raw.speakable_selectors as string[])
      : ["h1", ".article-intro", "h2"],
  };
}

// --- API functions (server-side, no localStorage) ---

export async function getPosts(
  page = 1,
  limit = 9,
  category = "",
): Promise<PaginatedResponse<BlogPost>> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category) params.set("category", category);
    const res = await fetch(`${API}/api/blog/posts?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { data?: { data?: unknown[]; page?: number; totalPages?: number; total?: number } };
    const payload = json.data || {};
    return {
      data: ((payload.data as Record<string, unknown>[]) || []).map(normalizePost),
      page: payload.page || page,
      totalPages: payload.totalPages || 1,
      total: payload.total || 0,
    };
  } catch {
    return { data: [], page, totalPages: 0, total: 0 };
  }
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API}/api/blog/posts/${slug}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Record<string, unknown> };
    return normalizePost((json.data || json) as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getRelatedPosts(slug: string): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API}/api/blog/posts/${slug}/related`);
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: unknown[] };
    return ((json.data as Record<string, unknown>[]) || []).map(normalizePost);
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${API}/api/blog/categories`);
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: string[] };
    return json.data || [];
  } catch {
    return [];
  }
}

export async function getAllSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API}/api/sitemap-data`);
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: Array<{ slug: string }> };
    return (json.data || []).map((p) => p.slug);
  } catch {
    return [];
  }
}

// --- Image variant helpers ---

export type ImageVariant = "card" | "featured" | "public";

export function getImageUrl(
  url: string | undefined,
  variant: ImageVariant,
): string | undefined {
  if (!url) return undefined;
  // Replace last path segment (current variant) with the requested variant
  return url.replace(/\/[^/]+$/, `/${variant}`);
}
