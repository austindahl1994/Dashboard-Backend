// ROUTES FOR BINGO API
import cabbageMiddleware from "@/middleware/cabbageMiddleware.ts";
import { osrsHiscoresLimiter } from "@/middleware/rateLimitMiddleware.ts";
import express from "express";
import * as bc from "./bingoController.ts";

const router = express.Router();

const requireModerator = (
  req: express.Request & { cabbage?: { role?: string } },
  res: express.Response,
  next: express.NextFunction,
) => {
  if (req.cabbage?.role !== "moderator" && req.cabbage?.role !== "admin") {
    return res.status(403).json({
      message: "Moderator access required",
      error: "Moderator access required",
    });
  }

  return next();
};

router.post("/signup", cabbageMiddleware, bc.submitBingoSignup);
router.get("/signup/me", cabbageMiddleware, bc.getMyBingoSignup);
router.get("/signups", cabbageMiddleware, requireModerator, bc.getBingoSignups);
router.patch(
  "/signups/:id/status",
  cabbageMiddleware,
  requireModerator,
  bc.setBingoSignupStatus,
);
router.delete(
  "/signups/:id",
  cabbageMiddleware,
  requireModerator,
  bc.removeBingoSignup,
);
router.get("/players", cabbageMiddleware, requireModerator, bc.getBingoPlayers);
router.get(
  "/hiscores",
  cabbageMiddleware,
  osrsHiscoresLimiter,
  bc.getOsrsHiscores,
);

export default router;
