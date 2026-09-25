// OSRS hiscores lookups are proxied through the API because
// secure.runescape.com does not send CORS headers.

export type OsrsHiscoreSkill = {
  id: number;
  name: string;
  rank: number;
  level: number;
  xp: number;
};

export type OsrsHiscoreActivity = {
  id: number;
  name: string;
  rank: number;
  score: number;
};

export type OsrsHiscoresPlayer = {
  name: string;
  skills: OsrsHiscoreSkill[];
  activities: OsrsHiscoreActivity[];
};

export type OsrsHiscoresResult =
  | { ok: true; player: OsrsHiscoresPlayer }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "upstream"; error: string };

const HISCORES_BASE_URL =
  "https://secure.runescape.com/m=hiscore_oldschool/index_lite.json";
const REQUEST_TIMEOUT_MS = 8000;

export const MAX_RSN_LENGTH = 12;

const RSN_PATTERN = /^[A-Za-z0-9 _-]{1,12}$/;

export const normalizeRsn = (value: unknown): string | null => {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();

  return RSN_PATTERN.test(trimmed) ? trimmed : null;
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 300;

type CacheEntry = { player: OsrsHiscoresPlayer; expiresAt: number };

// Map iteration order is insertion order, so the first key is always the oldest.
const hiscoresCache = new Map<string, CacheEntry>();

const cacheKey = (rsn: string): string => rsn.trim().toLowerCase();

const readCache = (rsn: string): OsrsHiscoresPlayer | null => {
  const key = cacheKey(rsn);
  const entry = hiscoresCache.get(key);

  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    hiscoresCache.delete(key);
    return null;
  }

  return entry.player;
};

const writeCache = (rsn: string, player: OsrsHiscoresPlayer) => {
  const now = Date.now();

  for (const [key, entry] of hiscoresCache) {
    if (entry.expiresAt <= now) hiscoresCache.delete(key);
  }

  // The key is user-influenced, so the cache is hard-capped to bound memory.
  while (hiscoresCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = hiscoresCache.keys().next().value;
    if (oldestKey === undefined) break;
    hiscoresCache.delete(oldestKey);
  }

  hiscoresCache.set(cacheKey(rsn), {
    player,
    expiresAt: now + CACHE_TTL_MS,
  });
};

export const hasCachedHiscores = (rsn: string): boolean =>
  readCache(rsn) !== null;

export const fetchOsrsHiscores = async (
  rsn: string,
): Promise<OsrsHiscoresResult> => {
  const cached = readCache(rsn);

  if (cached) {
    return { ok: true, player: cached };
  }

  // Hardcoded base + encoded query param only: the rsn can never alter the path.
  const url = `${HISCORES_BASE_URL}?player=${encodeURIComponent(rsn)}`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.status === 404) {
      return { ok: false, reason: "not_found" };
    }

    if (!response.ok) {
      return {
        ok: false,
        reason: "upstream",
        error: `OSRS hiscores responded with status ${response.status}`,
      };
    }

    const player = (await response.json()) as OsrsHiscoresPlayer;

    writeCache(rsn, player);

    return { ok: true, player };
  } catch (error) {
    return {
      ok: false,
      reason: "upstream",
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
