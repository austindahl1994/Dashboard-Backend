import express from "express";
import { uploadImage } from "../../middleware/multerMiddleware.js";
import { board, team, upload } from "./vingoController.js";
import { playerAuthJWT } from "../../middleware/authMiddleware.js";

// Route for image upload from dink
// Route for image upload from player discord or is the same?
// Route to get board
// Route to get teamData

const router = express.Router();

router.post("/bingo/upload", uploadImage.single("file"), upload);
router.get("/bingo/board", playerAuthJWT, board);
router.get("/bingo/team", playerAuthJWT, team);

export default router;
