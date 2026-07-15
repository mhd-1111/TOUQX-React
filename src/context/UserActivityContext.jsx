import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchTMDB } from '../api/tmdb';

const UserActivityContext = createContext(null);

export const useUserActivity = () => {
  const ctx = useContext(UserActivityContext);
  if (!ctx) throw new Error('useUserActivity must be used within UserActivityProvider');
  return ctx;
};

const load = (key) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
};

const save = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
};

// ── Hero string-ID → TMDB mapping (for migrating old localStorage entries) ──
const HERO_ID_TO_TMDB = {
  "stranger-things":          { tmdbId: 66732,  tmdbType: "tv" },
  "extraction-2":             { tmdbId: 697843, tmdbType: "movie" },
  "peaky-blinders":           { tmdbId: 60574,  tmdbType: "tv" },
  "john-wick-chapter-4":      { tmdbId: 603692, tmdbType: "movie" },
  "the-boys":                 { tmdbId: 76479,  tmdbType: "tv" },
  "spider-man-brand-new-day": { tmdbId: 315635, tmdbType: "movie" },
  "breaking-bad":             { tmdbId: 1396,   tmdbType: "tv" },
};

/** Returns true for valid TMDB poster paths like "/abc123.jpg" */
function hasValidPoster(path) {
  return !!path && typeof path === 'string' && /^\/[A-Za-z0-9]+\.\w+$/.test(path);
}

/** Synchronously fix a single item: add tmdbId/tmdbType, clear bad poster_path */
function migrateItem(item) {
  let migrated = { ...item };
  let changed = false;

  // Map old string hero IDs to numeric TMDB IDs
  if (!migrated.tmdbId && typeof migrated.id === 'string' && HERO_ID_TO_TMDB[migrated.id]) {
    const hero = HERO_ID_TO_TMDB[migrated.id];
    migrated.tmdbId = hero.tmdbId;
    migrated.tmdbType = hero.tmdbType;
    changed = true;
  }

  // Clear poster_path if it's a local path (not a TMDB path)
  if (migrated.poster_path && !hasValidPoster(migrated.poster_path)) {
    migrated.poster_path = null;
    changed = true;
  }

  return changed ? migrated : item;
}

/** Migrate a list, returning the same reference if nothing changed */
function migrateList(list) {
  let changed = false;
  const result = list.map(item => {
    const migrated = migrateItem(item);
    if (migrated !== item) changed = true;
    return migrated;
  });
  return changed ? result : list;
}

export const UserActivityProvider = ({ children }) => {
  const [liked, setLiked]     = useState(() => load('touqx_liked'));
  const [saved, setSaved]     = useState(() => load('touqx_saved'));
  const [watched, setWatched] = useState(() => load('touqx_watched'));
  const [history, setHistory] = useState(() => load('touqx_history'));

  useEffect(() => save('touqx_liked',   liked),   [liked]);
  useEffect(() => save('touqx_saved',   saved),   [saved]);
  useEffect(() => save('touqx_watched', watched), [watched]);
  useEffect(() => save('touqx_history', history), [history]);

  // ── One-time migration & poster enrichment ───────────────────────────────
  // Fixes old localStorage entries: adds tmdbId/tmdbType, fetches poster_path.
  // Idempotent — items already migrated are untouched.
  useEffect(() => {
    const migrateAndEnrich = async () => {
      // Step 1: Synchronous migration (add tmdbId, clear invalid poster_path)
      const lists = {
        history: migrateList(history),
        liked:   migrateList(liked),
        saved:   migrateList(saved),
        watched: migrateList(watched),
      };

      // Step 2: Collect unique tmdbIds that still need poster_path
      const needsFetch = new Map(); // tmdbId → tmdbType
      for (const items of Object.values(lists)) {
        for (const item of items) {
          if (item.tmdbId && !hasValidPoster(item.poster_path) && !needsFetch.has(item.tmdbId)) {
            needsFetch.set(item.tmdbId, item.tmdbType || 'movie');
          }
        }
      }

      // Step 3: Fetch poster_path from TMDB (one call per unique tmdbId)
      const posterMap = new Map(); // tmdbId → poster_path
      if (needsFetch.size > 0) {
        await Promise.all(
          Array.from(needsFetch.entries()).map(async ([tmdbId, tmdbType]) => {
            try {
              const data = await fetchTMDB(`/${tmdbType}/${tmdbId}`);
              if (data.poster_path) posterMap.set(tmdbId, data.poster_path);
            } catch { /* silently skip failed fetches */ }
          })
        );
      }

      // Step 4: Apply fetched poster_path to all items that need it
      const enrich = (items) => {
        if (posterMap.size === 0) return items;
        let changed = false;
        const result = items.map(item => {
          if (item.tmdbId && posterMap.has(item.tmdbId) && !hasValidPoster(item.poster_path)) {
            changed = true;
            return { ...item, poster_path: posterMap.get(item.tmdbId) };
          }
          return item;
        });
        return changed ? result : items;
      };

      const finalH = enrich(lists.history);
      const finalL = enrich(lists.liked);
      const finalS = enrich(lists.saved);
      const finalW = enrich(lists.watched);

      // Only update state if something actually changed
      if (finalH !== history) setHistory(finalH);
      if (finalL !== liked)   setLiked(finalL);
      if (finalS !== saved)   setSaved(finalS);
      if (finalW !== watched) setWatched(finalW);
    };

    migrateAndEnrich();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const normalise = (movie) => ({
    id:           movie.id,
    title:        movie.title || movie.name || '',
    poster_path:  movie.poster_path || null,
    tmdbId:       movie.tmdbId || movie.id || null,
    tmdbType:     movie.tmdbType || movie.media_type || (movie.title ? 'movie' : 'movie'),
    media_type:   movie.title ? 'movie' : (movie.media_type || 'movie'),
    vote_average: movie.vote_average ?? null,
    release_date: movie.release_date || movie.first_air_date || null,
    addedAt:      Date.now(),
  });

  const toggleLike = useCallback((movie) => {
    const item = normalise(movie);
    setLiked(prev => {
      const exists = prev.some(m => m.id === item.id);
      return exists ? prev.filter(m => m.id !== item.id) : [item, ...prev];
    });
  }, []);

  const toggleSave = useCallback((movie) => {
    const item = normalise(movie);
    setSaved(prev => {
      const exists = prev.some(m => m.id === item.id);
      return exists ? prev.filter(m => m.id !== item.id) : [item, ...prev];
    });
  }, []);

  const toggleWatched = useCallback((movie) => {
    const item = normalise(movie);
    setWatched(prev => {
      const exists = prev.some(m => m.id === item.id);
      return exists ? prev.filter(m => m.id !== item.id) : [item, ...prev];
    });
  }, []);

  const addToHistory = useCallback((movie) => {
    const item = normalise(movie);
    setHistory(prev => {
      const filtered = prev.filter(m => m.id !== item.id);
      return [item, ...filtered].slice(0, 100); // keep last 100
    });
  }, []);

  const isLiked   = useCallback((id) => liked.some(m   => m.id === id), [liked]);
  const isSaved   = useCallback((id) => saved.some(m   => m.id === id), [saved]);
  const isWatched = useCallback((id) => watched.some(m => m.id === id), [watched]);

  return (
    <UserActivityContext.Provider value={{
      liked, saved, watched, history,
      toggleLike, toggleSave, toggleWatched, addToHistory,
      isLiked, isSaved, isWatched,
    }}>
      {children}
    </UserActivityContext.Provider>
  );
};
