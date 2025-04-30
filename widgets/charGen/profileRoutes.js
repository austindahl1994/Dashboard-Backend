import express from "express";
import * as pc from "./profileController.js";

const router = express.Router();

router.post("/save/:name", pc.saveProfile);
router.get("/recent", pc.getRecentProfiles); 
router.delete("/delete/:name", pc.deleteProfile);
router.get("/:name", pc.getProfile);

export default router;
