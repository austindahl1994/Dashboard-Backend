import express from "express";
import * as pc from "./profileController.js";

const router = express.Router();

router.post("/createProfile/:name", pc.createProfile)
router.get("/recent", pc.getRecentProfiles); 
router.put("/update/:name", pc.updateProfile)
router.delete("/delete/:name", pc.deleteProfile);
router.get("/:name", pc.getProfile);

export default router;
