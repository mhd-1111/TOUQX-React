/**
 * posterUtils.js — Pure, synchronous TMDB poster URL helpers.
 *
 * ✅ Zero API calls — only builds URLs from existing data.
 * ✅ Every component should import from here instead of constructing URLs inline.
 */

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * A minimal 2×3 SVG data-URI used when no poster is available.
 * Renders a dark card with a film-frame icon — never a broken <img>.
 */
export const POSTER_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='750' viewBox='0 0 500 750'%3E" +
  "%3Crect width='500' height='750' fill='%23181818'/%3E" +
  "%3Crect x='180' y='305' width='140' height='140' rx='18' fill='none' stroke='%23333' stroke-width='6'/%3E" +
  "%3Ccircle cx='250' cy='375' r='35' fill='none' stroke='%23333' stroke-width='5'/%3E" +
  "%3Ccircle cx='250' cy='375' r='12' fill='%23333'/%3E" +
  "%3C/svg%3E";

/**
 * Returns true when `path` looks like a valid TMDB image path fragment
 * (e.g. "/kF4MBPcmOn0B3ooZfjdSp3Gs1JG.jpg").
 *
 * Rejects:
 *  - null / undefined / empty
 *  - Local asset paths  (e.g. "/images/hero.jpg")
 *  - Full URLs          (e.g. "https://...")
 */
function isValidTmdbPath(path) {
  if (!path || typeof path !== 'string') return false;
  // TMDB paths are always   /[hash].[ext]   — a single slash followed by
  // an alphanumeric hash.  Local paths have deeper segments ("/images/…").
  return /^\/[A-Za-z0-9]+\.\w+$/.test(path);
}

/**
 * Build a full TMDB image URL from a path fragment.
 *
 * @param {string|null} posterPath  — e.g. "/kF4MBPcmOn0B3ooZfjdSp3Gs1JG.jpg"
 * @param {string}      size        — TMDB size token (w185, w342, w500, w780, original)
 * @returns {string|null}           — full URL or null if the path is invalid
 *
 * @example
 *   getTmdbPosterUrl('/abc123.jpg');          // "https://image.tmdb.org/t/p/w500/abc123.jpg"
 *   getTmdbPosterUrl('/abc123.jpg', 'w342');  // "https://image.tmdb.org/t/p/w342/abc123.jpg"
 *   getTmdbPosterUrl(null);                   // null
 *   getTmdbPosterUrl('/images/hero.jpg');      // null  (local path — not TMDB)
 */
export function getTmdbPosterUrl(posterPath, size = 'w500') {
  if (!isValidTmdbPath(posterPath)) return null;
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

/**
 * Given a movie / item object, resolve the best available poster source
 * from data that already exists on the object.  Pure — no fetches.
 *
 * Resolution order:
 *   1. movie.poster_path  (valid TMDB path → full URL)
 *   2. POSTER_FALLBACK    (inline SVG placeholder)
 *
 * @param {Object}  movie  — any object with a potential `poster_path` property
 * @param {string}  size   — TMDB size token
 * @returns {string}       — always returns a usable image src (never null)
 */
export function getMoviePosterSrc(movie, size = 'w500') {
  const url = getTmdbPosterUrl(movie?.poster_path, size);
  if (url) return url;
  return POSTER_FALLBACK;
}
