// src/components/blog/BlogSidebar.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Tag, ArrowRight, GraduationCap } from "lucide-react";
import { getRelatedPosts, getAllTags, formatDate } from "../../data/blogData";

export default function BlogSidebar({ currentPostId, courseLink }) {
  const relatedPosts = getRelatedPosts(currentPostId, 3);
  const allTags = getAllTags().slice(0, 20); // Cap for layout

  return (
    <aside
      className="space-y-6 lg:sticky lg:top-24 lg:self-start"
      aria-label="Blog sidebar"
    >
      {/* ── CTA Card ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl overflow-hidden shadow-md"
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)",
        }}
      >
        <div className="p-6">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-4">
            <GraduationCap size={22} className="text-white" aria-hidden="true" />
          </div>
          <h3 className="text-white font-bold text-lg leading-snug mb-2">
            Ready to Get Certified?
          </h3>
          <p className="text-blue-200 text-sm leading-relaxed mb-5">
            Join thousands of professionals who have advanced their careers with
            HK International&apos;s accredited health &amp; safety courses.
          </p>
          <Link
            to={courseLink || "/courses"}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm transition-colors duration-200"
          >
            Explore Courses
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link
            to="/contact"
            className="flex items-center justify-center gap-2 w-full mt-2.5 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors duration-200"
          >
            Talk to an Advisor
          </Link>
        </div>
      </motion.div>

      {/* ── Related Posts ────────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-[#1e3a5f]" aria-hidden="true" />
            <h3 className="font-bold text-[#1e3a5f] text-base">
              Related Articles
            </h3>
          </div>

          <ul className="space-y-4" role="list">
            {relatedPosts.map((post, idx) => (
              <li
                key={post.id}
                className={
                  idx < relatedPosts.length - 1
                    ? "pb-4 border-b border-gray-100"
                    : ""
                }
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group flex gap-3"
                  aria-label={`Read: ${post.title}`}
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={post.coverImage}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "/images/blog/placeholder.jpg";
                      }}
                    />
                  </div>
                  {/* Text */}
                  <div className="min-w-0">
                    <span className="text-xs text-orange-500 font-semibold block mb-0.5">
                      {post.category}
                    </span>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-[#1e3a5f] transition-colors duration-200 leading-snug">
                      {post.title}
                    </p>
                    <span className="text-xs text-gray-400 mt-1 block">
                      {formatDate(post.publishedDate)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* ── Tags Cloud ───────────────────────────────────────── */}
      {allTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Tag size={16} className="text-[#1e3a5f]" aria-hidden="true" />
            <h3 className="font-bold text-[#1e3a5f] text-base">
              Popular Topics
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Link
                key={tag}
                to={`/blog?tag=${encodeURIComponent(tag)}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-[#1e3a5f] hover:text-white transition-all duration-200"
              >
                {tag}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </aside>
  );
}
