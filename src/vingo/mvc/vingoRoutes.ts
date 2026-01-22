import express from "express";
import { uploadImage } from "../../middleware/multerMiddleware.js";
import {
  board,
  completions,
  team,
  dinkUpload,
  shame,
  highscores,
} from "./vingoController.js";
import { playerAuthJWT } from "../../middleware/authMiddleware.js";

// Route for image upload from dink
// Route for image upload from player discord or is the same?
// Route to get board
// Route to get teamData

const router = express.Router();
// Removed player auth for testing site
router.post("/upload", uploadImage.single("file"), dinkUpload);
router.get("/board", board);
router.post("/team", playerAuthJWT, team);
router.post("/completions", playerAuthJWT, completions);
router.post("/shame", playerAuthJWT, shame);
router.get("/highscores", highscores);
// router.post("/event", event);
// router.post("/broadcast", broadcast);

export default router;
