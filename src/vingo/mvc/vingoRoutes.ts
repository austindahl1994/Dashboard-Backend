import express from "express";
import { uploadImage } from "../../middleware/multerMiddleware.js";
import { board, team, upload, event, broadcast } from "./vingoController.js";
import { playerAuthJWT } from "../../middleware/authMiddleware.js";

// Route for image upload from dink
// Route for image upload from player discord or is the same?
// Route to get board
// Route to get teamData

const router = express.Router();

router.post("/upload", uploadImage.single("file"), upload);
router.get("/board", playerAuthJWT, board);
router.get("/team", playerAuthJWT, team);
router.post("/event", playerAuthJWT, event);
router.post("/broadcast", broadcast);

export default router;
