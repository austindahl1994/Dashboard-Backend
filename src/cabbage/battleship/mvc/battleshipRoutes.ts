// ROUTES FOR BATTLESHIP API
import { uploadImage } from "@/middleware/multerMiddleware.js";
import express from "express";
import {
  battleshipDinkData,
  battleshipEvents,
  getBoard,
} from "./battleshipController.ts";

const router = express.Router();

// router.post("/webImage", uploadImage.single("file"), webImage);
// router.get("/highscores", highscores);
router.post("/bsDink", uploadImage.single("file"), battleshipDinkData);
router.get("/board", getBoard);
router.get("/events", battleshipEvents);

export default router;
