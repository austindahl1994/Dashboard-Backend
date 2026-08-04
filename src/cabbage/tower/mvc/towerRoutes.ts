// ROUTES FOR BATTLESHIP API
import { uploadImage } from "@/middleware/multerMiddleware.js";
import cabbageMiddleware from "@/middleware/cabbageMiddleware.ts";
import express from "express";
import * as tc from "./towerController.ts";

const router = express.Router();

const requireModerator = (
  req: express.Request & { cabbage?: { role?: string } },
  res: express.Response,
  next: express.NextFunction,
) => {
  if (req.cabbage?.role !== "moderator") {
    return res.status(403).json({ error: "Moderator access required" });
  }

  return next();
};

// router.post("/webImage", uploadImage.single("file"), webImage);
// router.get("/highscores", highscores);
router.post("/towerDink", uploadImage.single("file"), tc.towerDinkData);
router.post(
  "/manualSubmission",
  cabbageMiddleware,
  uploadImage.single("file"),
  tc.manualSubmission,
);
router.get(
  "/getCompletions",
  cabbageMiddleware,
  requireModerator,
  tc.getTowerCompletions,
);
router.post("/towerData", cabbageMiddleware, tc.getTowerData);
router.get("/events", cabbageMiddleware, tc.towerEvents);

export default router;
