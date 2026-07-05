// src/pages/public/BlogPost.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronRight, Home } from "lucide-react";
import SEO from "../../components/SEO";
import BlogSidebar from "../../components/blog/BlogSidebar";
import ShareButtons from "../../components/blog/ShareButtons";
import TableOfContents from "../../components/blog/TableOfContents";
import { getPostBySlug, formatDate } from "../../data/blogData";
import MainLayout from "../../components/layout/MainLayout";

const SITE_URL = "https://hkinternational.uk";

// ── Reading Progress Bar ──────────────────────────────────────
function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      const total = scrollHeight - clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrollTop / total) * 100) : 0);
    }

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-gray-200/50 z-50"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <motion.div
        className="h-full bg-gradient-to-r from-orange-400 to-orange-500"
        style={{ width: `${progress}%` }}
        transition={{ ease: "linear", duration: 0.1 }}
      />
    </div>
  );
}

// ── Breadcrumb ────────────────────────────────────────────────
function Breadcrumb({ title }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap"
    >
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-[#1e3a5f] transition-colors duration-150"
      >
        <Home size={13} aria-hidden="true" />
        Home
      </Link>
      <ChevronRight size={13} className="text-gray-300" aria-hidden="true" />
      <Link
        to="/blog"
        className="hover:text-[#1e3a5f] transition-colors duration-150"
      >
        Blog
      </Link>
      <ChevronRight size={13} className="text-gray-300" aria-hidden="true" />
      <span
        className="text-gray-700 font-medium line-clamp-1 max-w-[200px] sm:max-w-xs"
        aria-current="page"
      >
        {title}
      </span>
    </nav>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);
  const contentRef = useRef(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  return (
    <MainLayout>
      {/* Reading progress */}
      <ReadingProgressBar />

      {/* SEO — single call: breadcrumbs are merged in here (see SEO.jsx)
          instead of a second <SEO> render, which used to emit a second,
          contradictory <title>/canonical pair with no url/title of its own
          and silently overwrite the correct ones with the homepage. */}
      <SEO
        title={post.metaTitle}
        description={post.metaDescription}
        url={postUrl}
        image={post.coverImage}
        schemaType="blogposting"
        blogData={post}
        breadcrumbs={breadcrumbs}
      />

      <main>
        {/* ── Cover Image Hero ─────────────────────────────── */}
        <div
          className="relative w-full overflow-hidden bg-gray-900"
          style={{ maxHeight: "520px" }}
        >
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full object-cover"
            style={{ maxHeight: "520px", opacity: 0.85 }}
            onError={(e) => {
              e.currentTarget.src = "/images/blog/placeholder.jpg";
            }}
          />
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
            }}
            aria-hidden="true"
          />

          {/* Hero text overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <span className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-orange-500 text-white">
                {post.category}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight max-w-3xl">
                {post.title}
              </h1>
              {/* Author row */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-white/80 text-sm">
                <span className="font-semibold text-white">{post.author}</span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} aria-hidden="true" />
                  <time dateTime={post.publishedDate}>
                    {formatDate(post.publishedDate)}
                  </time>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} aria-hidden="true" />
                  {post.readTime}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Page Content ─────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumb + Share row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-100">
            <Breadcrumb title={post.title} />
            <ShareButtons title={post.title} url={postUrl} />
          </div>

          {/* ── Two-column layout ─────────────────────────── */}
          <div className="flex flex-col lg:flex-row gap-10">
            {/* ── Main Content (65%) ──────────────────────── */}
            <article
              ref={contentRef}
              className="lg:w-[65%] min-w-0"
              aria-label="Article content"
            >
              {/* Excerpt / Intro */}
              <p className="text-lg text-gray-600 leading-relaxed font-medium mb-8 p-5 bg-blue-50 border-l-4 border-[#1e3a5f] rounded-r-xl">
                {post.excerpt}
              </p>

              {/* Table of Contents (mobile / tablet — above content) */}
              <div className="lg:hidden mb-8">
                <TableOfContents sections={post.sections} />
              </div>

              {/* Sections */}
              <div className="space-y-10">
                {post.sections.map((section) => (
                  <motion.section
                    key={section.id}
                    id={section.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.4 }}
                    aria-labelledby={`heading-${section.id}`}
                  >
                    <h2
                      id={`heading-${section.id}`}
                      className="text-2xl font-bold text-[#1e3a5f] mb-4 scroll-mt-24"
                    >
                      {section.heading}
                    </h2>
                    <div
                      className="prose-blog"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </motion.section>
                ))}
              </div>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-500 mb-3">
                    Tagged:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-[#1e3a5f] hover:text-white transition-all duration-200"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom share row */}
              <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    Found this helpful?
                  </p>
                  <p className="text-sm text-gray-500">
                    Share it with your network.
                  </p>
                </div>
                <ShareButtons title={post.title} url={postUrl} />
              </div>

              {/* Back to blog */}
              <div className="mt-8">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#1e3a5f] hover:text-orange-500 transition-colors duration-200"
                >
                  ← Back to all articles
                </Link>
              </div>
            </article>

            {/* ── Sidebar (35%) — desktop sticky ─────────── */}
            <aside className="lg:w-[35%] space-y-6">
              {/* Desktop TOC */}
              <div className="hidden lg:block">
                <TableOfContents sections={post.sections} />
              </div>

              <BlogSidebar
                currentPostId={post.id}
                courseLink={post.courseLink}
              />
            </aside>
          </div>
        </div>
      </main>

      {/* ── Prose styles (injected globally via <style>) ─────── */}
      <style>{`
        .prose-blog p {
          color: #374151;
          line-height: 1.8;
          margin-bottom: 1rem;
        }
        .prose-blog h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1e3a5f;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .prose-blog ul,
        .prose-blog ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
          color: #374151;
          line-height: 1.75;
        }
        .prose-blog ul { list-style-type: disc; }
        .prose-blog ol { list-style-type: decimal; }
        .prose-blog li { margin-bottom: 0.35rem; }
        .prose-blog strong { color: #111827; font-weight: 700; }
        .prose-blog a {
          color: #1e3a5f;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .prose-blog a:hover { color: #f97316; }
        .prose-blog table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.25rem 0;
          font-size: 0.9rem;
        }
        .prose-blog table th {
          background: #1e3a5f;
          color: white;
          padding: 10px 14px;
          text-align: left;
          font-weight: 600;
        }
        .prose-blog table td {
          padding: 9px 14px;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
        }
        .prose-blog table tr:nth-child(even) td {
          background: #f8fafc;
        }
        .scroll-mt-24 { scroll-margin-top: 6rem; }
      `}</style>
    </MainLayout>
  );
}