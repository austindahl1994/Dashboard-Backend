// ROUTES FOR BATTLESHIP API
import { uploadImage } from "@/middleware/multerMiddleware.js";
import express from "express";
import battleshipRoutes from "../../battleship/mvc/battleshipRoutes.ts";
import towerRoutes from "../../tower/mvc/towerRoutes.ts";
import * as cc from "./cabbageController.ts";

const router = express.Router();

router.use("/tower", towerRoutes);
router.use("/battleship", battleshipRoutes);
router.get("/check-session", cc.checkSession);
router.post("/login", cc.loginCabbage);
router.post("/logout", cc.logoutCabbageSession);
router.get("/events", cc.cabbageEvents);

export default router;

// Past Examples
// router.post("/webImage", uploadImage.single("file"), webImage);
// router.get("/highscores", highscores);
// router.post("/bsDink", uploadImage.single("file"), battleshipDinkData);
// router.get("/board", getBoard);
// router.get("/events", battleshipEvents);
