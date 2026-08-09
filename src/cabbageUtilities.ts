import { CabbageRequest } from "./middleware/cabbageMiddleware.ts";
import type { Response } from "express";
import { cabbageUsersByDiscordID } from "./cabbage/cabbage-main/globalCabbage.ts";

const getCabbageIdFromRequest = (req: CabbageRequest): number | null => {
  const discordId = req.cabbage?.discord_id;

  if (!discordId) {
    return null;
  }

  return cabbageUsersByDiscordID.get(discordId)?.id ?? null;
};

const sendError = (
  res: Response,
  status: number,
  message: string,
  details?: unknown,
) => {
  return res.status(status).json({
    message,
    error: message,
    ...(details ? { details } : {}),
  });
};

export { getCabbageIdFromRequest, sendError };
