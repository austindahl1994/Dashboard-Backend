import express from "express";
import * as pc from "./profileController.js";

const router = express.Router();

router.get("/", pc.profileHome);
router.post("/create", pc.createProfile)
router.get("/:name", pc.getProfile);
router.get("/recent/:amount", pc.getRecentProfiles); 

export default router;
