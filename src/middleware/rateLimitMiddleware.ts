import type { Response } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import type { CabbageRequest } from "./cabbageMiddleware.ts";
import { getCabbageIdFromRequest } from "@/cabbageUtilities.ts";
import { hasCachedHiscores, normalizeRsn } from "@/services/osrs/hiscores.ts";

const HISCORES_WINDOW_MS = 60 * 1000;
const HISCORES_MAX_REQUESTS = 20;

const cabbageKeyGenerator = (req: CabbageRequest): string => {
  const cabbageId = getCabbageIdFromRequest(req);

  if (cabbageId !== null) return `cabbage:${cabbageId}`;

  return `ip:${ipKeyGenerator(req.ip ?? "")}`;
};

export const osrsHiscoresLimiter = rateLimit({
  windowMs: HISCORES_WINDOW_MS,
  limit: HISCORES_MAX_REQUESTS,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: cabbageKeyGenerator,
  // Only real upstream calls need protection, so cached lookups are free.
  skip: (req: CabbageRequest) => {
    const rsn = normalizeRsn(req.query.rsn);
    return rsn !== null && hasCachedHiscores(rsn);
  },
  handler: (_req, res: Response) => {
    res.setHeader("Retry-After", Math.ceil(HISCORES_WINDOW_MS / 1000));
    return res.status(429).json({
      message: "Too many hiscores lookups, please slow down and try again.",
      error: "Too many hiscores lookups, please slow down and try again.",
    });
  },
});

export default osrsHiscoresLimiter;
