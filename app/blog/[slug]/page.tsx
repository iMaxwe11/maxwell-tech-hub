import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, PenLine, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { POSTS, SORTED_POSTS, getPostById } from "@/lib/blog-posts";
import { getPostIcon, CATEGORY_COLORS } from "@/lib/blog-icons";
import { createPageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site-config";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.id }));
}

// Only the slugs above exist — anything else is a 404 at build time.
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostById(slug);
  if (!post) return {};

  return {
    ...createPageMetadata({
      title: post.title,
      description: post.excerpt,
      path: `/blog/${post.id}`,
      keywords: post.tags,
      tag: post.original ? "Build Log" : post.category.toUpperCase(),
    }),
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostById(slug);
  if (!post) notFound();

  const color = CATEGORY_COLORS[post.category] || "#06b6d4";
  const Icon = getPostIcon(post.icon);
  const paragraphs = post.content.split("\n\n");

  const index = SORTED_POSTS.findIndex((p) => p.id === post.id);
  const newer = index > 0 ? SORTED_POSTS[index - 1] : null;
  const older = index < SORTED_POSTS.length - 1 ? SORTED_POSTS[index + 1] : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    url: `${siteConfig.url}/blog/${post.id}`,
    keywords: post.tags.join(", "),
    author: post.original
      ? { "@type": "Person", name: siteConfig.name, url: siteConfig.url }
      : { "@type": "Organization", name: `${siteConfig.domain} (AI-curated)` },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="aurora-bg">
        <div className="aurora-band" />
        <div className="aurora-band" />
      </div>

      <Navbar breadcrumb={["blog", post.id]} accent={color} />

      <main className="pt-28 pb-24 px-4 sm:px-6 relative z-10">
        <article className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-mono text-white/40 hover:text-cyan-400 transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            <span>All posts</span>
          </Link>

          {/* Header */}
          <div className="glass-card p-6 sm:p-10 relative overflow-hidden">
            <div
              className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20"
              style={{ background: color }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <span
                  className="p-2 rounded-lg border"
                  style={{ background: `${color}15`, borderColor: `${color}40`, color }}
                >
                  <Icon size={20} />
                </span>
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-mono border"
                  style={{ background: `${color}15`, borderColor: `${color}40`, color }}
                >
                  {post.category.toUpperCase()}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border border-white/10 text-white/40"
                  title={
                    post.original
                      ? "Written by Maxwell from real project work"
                      : "AI-curated micro-article"
                  }
                >
                  {post.original ? <PenLine size={11} /> : <Sparkles size={11} />}
                  {post.original ? "FIELD NOTES" : "AI-CURATED"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                {post.title}
              </h1>

              <div className="mt-4 flex items-center gap-3 flex-wrap text-xs font-mono text-white/40">
                <time dateTime={post.date}>{post.date}</time>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>

              <p className="mt-6 text-lg text-white/70 leading-relaxed pb-6 border-b border-white/10">
                {post.excerpt}
              </p>

              {/* Content */}
              <div className="mt-6 space-y-4">
                {paragraphs.map((para, i) => (
                  <p key={i} className="text-white/60 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/10">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full text-[10px] font-mono border"
                    style={{ background: `${color}10`, borderColor: `${color}30`, color }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Prev / Next */}
          <nav className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {older ? (
              <Link
                href={`/blog/${older.id}`}
                className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all"
              >
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/30 group-hover:text-cyan-400/60 transition-colors">
                  <ArrowLeft size={12} /> OLDER
                </span>
                <span className="mt-2 block text-sm font-semibold text-white/70 group-hover:text-white transition-colors line-clamp-2">
                  {older.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {newer && (
              <Link
                href={`/blog/${newer.id}`}
                className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all sm:text-right"
              >
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-white/30 group-hover:text-cyan-400/60 transition-colors sm:justify-end">
                  NEWER <ArrowRight size={12} />
                </span>
                <span className="mt-2 block text-sm font-semibold text-white/70 group-hover:text-white transition-colors line-clamp-2">
                  {newer.title}
                </span>
              </Link>
            )}
          </nav>
        </article>
      </main>
    </>
  );
}
