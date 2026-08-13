import fetch from "node-fetch";

/**
 * Best-effort download of a remote image (org logo, AO logo) for embedding
 * in a generated PDF. Templates must never fail to render because a logo
 * URL is slow, missing, or unreachable — every caller treats `null` as
 * "draw the vector fallback instead".
 * @param {string} url
 * @param {number} timeoutMs
 * @returns {Promise<Buffer|null>}
 */
const fetchImageBuffer = async (url, timeoutMs = 4000) => {
  if (!url) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const arrBuffer = await res.arrayBuffer();
    return Buffer.from(arrBuffer);
  } catch (err) {
    console.error("certificate logo fetch skipped:", err.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
};

export default fetchImageBuffer;
