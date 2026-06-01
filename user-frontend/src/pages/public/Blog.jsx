// src/pages/public/Blog.jsx
import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, ArrowRight, Tag } from "lucide-react";
import SEO from "../../components/SEO";
import BlogCard from "../../components/blog/BlogCard";
import { blogPosts, getAllCategories, formatDate } from "../../data/blogData";
import MainLayout from "../../components/layout/MainLayout";

const INITIAL_COUNT = 9;
const LOAD_MORE_COUNT = 6;

const SITE_URL = "https://hkinternational.uk";

// Image loader
function SafeImage({
  src,
  alt,
  className = "",
  fallback = "/images/blog/placeholder.jpg",
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100" />
      )}

      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!hasTriedFallback) {
            setImgSrc(fallback);
            setHasTriedFallback(true); // only try fallback once
          } else {
            setLoaded(true); // stop shimmer even if fallback fails
          }
        }}
        className={`${className} ${
          loaded ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
      />
    </div>
  );
}


export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const searchQuery = searchParams.get("q") || "";
  const activeCategory = searchParams.get("category") || "";
  const activeTag = searchParams.get("tag") || "";

  const categories = getAllCategories();

  // ── Filtering ──────────────────────────────────────────────
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q));

      const matchesCategory =
        !activeCategory || post.category === activeCategory;

      const matchesTag =
        !activeTag ||
        post.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase());

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [searchQuery, activeCategory, activeTag]);

  const hasFilters = searchQuery || activeCategory || activeTag;
  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  // ── Featured post (only when no filters) ──────────────────
  const featuredPost = !hasFilters
    ? blogPosts.find((p) => p.featured) || blogPosts[0]
    : null;

  function setParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    // Reset pagination on filter change
    setVisibleCount(INITIAL_COUNT);
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams({});
    setVisibleCount(INITIAL_COUNT);
  }

  return (
    <MainLayout>
      <SEO
        title="Health & Safety Blog | Expert Guidance | 1A HK International"
        description="Expert articles on NEBOSH, IOSH, OTHM, workplace safety, and health & safety careers. Trusted guidance for professionals in the UK and India."
        canonical="/blog"
        schemaType="organization"
      />

      <main>
        {/* ── Hero ──────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden py-20 md:py-28 bg-linear-to-br from-indigo-800 to-orange-800"
          aria-labelledby="blog-hero-heading"
        >
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
            aria-hidden="true"
          />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
                <BookOpen size={14} aria-hidden="true" />
                Expert Insights &amp; Guidance
              </div>
              <h1
                id="blog-hero-heading"
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4"
              >
                Health &amp; Safety
                <br />
                <span className="text-orange-400">Knowledge Hub</span>
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto leading-relaxed">
                Expert guidance on NEBOSH, IOSH, OTHM qualifications, workplace
                safety, and building a rewarding health &amp; safety career.
              </p>
            </motion.div>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 max-w-xl mx-auto"
            >
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
                <label htmlFor="blog-search" className="sr-only">
                  Search articles
                </label>
                <input
                  id="blog-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setParam("q", e.target.value)}
                  placeholder="Search articles…"
                  className="w-full pl-11 pr-10 py-3.5 rounded-full bg-white text-gray-900 placeholder-gray-400 text-sm outline-none focus:ring-2 focus:ring-orange-400 shadow-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setParam("q", "")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Category Filters ─────────────────────────────── */}
        <section
          className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm"
          aria-label="Category filters"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
              <button
                onClick={() => setParam("category", "")}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  !activeCategory
                    ? "bg-[#1e3a5f] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                aria-pressed={!activeCategory}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setParam("category", cat === activeCategory ? "" : cat)
                  }
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-[#1e3a5f] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  aria-pressed={activeCategory === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Active filters bar */}
          {hasFilters && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center flex-wrap gap-2 mb-6"
            >
              <span className="text-sm text-gray-500 font-medium">
                Filters:
              </span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-semibold px-3 py-1 rounded-full">
                  Search: &ldquo;{searchQuery}&rdquo;
                  <button
                    onClick={() => setParam("q", "")}
                    aria-label="Remove search filter"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              )}
              {activeCategory && (
                <span className="inline-flex items-center gap-1.5 bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-semibold px-3 py-1 rounded-full">
                  {activeCategory}
                  <button
                    onClick={() => setParam("category", "")}
                    aria-label="Remove category filter"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              )}
              {activeTag && (
                <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                  <Tag size={11} aria-hidden="true" />
                  {activeTag}
                  <button
                    onClick={() => setParam("tag", "")}
                    aria-label="Remove tag filter"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-700 font-semibold underline underline-offset-2"
              >
                Clear all
              </button>
              <span className="text-xs text-gray-400 ml-auto">
                {filteredPosts.length} article
                {filteredPosts.length !== 1 ? "s" : ""}
              </span>
            </motion.div>
          )}

          {/* ── Featured Post (no filters) ─────────────────── */}
          <AnimatePresence>
            {featuredPost && !hasFilters && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-12"
              >
                <Link
                  to={`/blog/${featuredPost.slug}`}
                  className="group block rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-white border border-gray-100"
                  aria-label={`Featured: ${featuredPost.title}`}
                >
                  <div className="md:flex">
                    {/* Image */}
                    <div className="md:w-1/2 relative h-[320px] md:h-auto overflow-hidden">
                      {/* <img
                        src={featuredPost.coverImage}
                        alt={featuredPost.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = "/images/blog/placeholder.jpg";
                        }}
                      /> */}
                      <SafeImage
                        src={featuredPost.coverImage}
                        alt={featuredPost.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Featured
                      </span>
                    </div>
                    {/* Content */}
                    <div className="md:w-1/2 p-8 flex flex-col justify-center">
                      <span className="text-xs font-semibold text-[#1e3a5f] bg-blue-50 px-3 py-1 rounded-full inline-block mb-3 w-fit">
                        {featuredPost.category}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-[#1e3a5f] transition-colors duration-200">
                        {featuredPost.title}
                      </h2>
                      <p className="text-gray-500 text-base leading-relaxed mb-5 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatDate(featuredPost.publishedDate)} ·{" "}
                          {featuredPost.readTime}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-[#1e3a5f] group-hover:text-orange-500 transition-colors duration-200">
                          Read article{" "}
                          <ArrowRight size={14} aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Blog Grid ─────────────────────────────────── */}
          {visiblePosts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                <AnimatePresence>
                  {visiblePosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </AnimatePresence>
              </div>

              {/* Load More */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-12 text-center"
                >
                  <button
                    onClick={() => setVisibleCount((c) => c + LOAD_MORE_COUNT)}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-[#1e3a5f] text-[#1e3a5f] font-semibold text-sm hover:bg-[#1e3a5f] hover:text-white transition-all duration-200"
                  >
                    Load More Articles
                    <span className="text-xs opacity-60">
                      ({filteredPosts.length - visibleCount} remaining)
                    </span>
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            /* ── Empty State ─────────────────────────────── */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
                <Search
                  size={24}
                  className="text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                No articles found
              </h2>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                We couldn&apos;t find any posts matching your current filters.
                Try adjusting your search or clearing the filters.
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1e3a5f] text-white font-semibold text-sm hover:bg-orange-500 transition-colors duration-200"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </MainLayout>
  );
}
