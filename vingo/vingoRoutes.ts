import express from "express";
import { upload } from "../../middleware/multerMiddleware.js";
import * as vingoController from "./vingoController.ts"
// Route for image upload from dink
// Route for image upload from player discord or is the same?
// Route to get board
// Route to get teamData

const router = express.Router();

router.post("/bingo/upload", upload.single("file"), vingoController.uploadController);
router.get("/bingo/board", playerAuthJWT, vingoController.boardController)
router.get("/bingo/team", playerAuthJWT, vingoController.teamController)

export default router;
