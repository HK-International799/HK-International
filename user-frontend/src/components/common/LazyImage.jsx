/**
 * Drop-in <img> replacement for any image that is NOT the LCP element
 * (i.e. everything except the first hero slide). Defers offscreen image
 * downloads until the browser is about to need them, and hints the
 * decoder to not block the main thread.
 *
 * Usage:
 *   <LazyImage src="/images/course-thumb.webp" alt="IOSH Managing Safely" />
 *
 * Do NOT use this for the homepage hero's first slide — that image should
 * stay loading="eager" fetchPriority="high" so it isn't delayed.
 */
export default function LazyImage({
  src,
  alt,
  className = "",
  width,
  height,
  ...rest
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={className}
      {...rest}
    />
  );
}
