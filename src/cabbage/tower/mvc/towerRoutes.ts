// ROUTES FOR BATTLESHIP API
import { uploadImage } from "@/middleware/multerMiddleware.js";
import cabbageMiddleware from "@/middleware/cabbageMiddleware.ts";
import express from "express";
import * as tc from "./towerController.ts";

const router = express.Router();

// router.post("/webImage", uploadImage.single("file"), webImage);
// router.get("/highscores", highscores);
router.post("/towerDink", uploadImage.single("file"), tc.towerDinkData);
router.post(
  "/towerData",
  cabbageMiddleware,
  uploadImage.single("file"),
  tc.manualSubmission,
);
router.post("/towerData", cabbageMiddleware, tc.getTowerData);
router.get("/events", cabbageMiddleware, tc.towerEvents);

export default router;
