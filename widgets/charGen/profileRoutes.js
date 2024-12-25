import express from "express";
import * as pc from "./profileController.js";

const router = express.Router();

router.get("/", pc.profileHome);
router.post("/create", pc.createProfile)
router.get("/:name/:id", pc.getProfile);
router.get("/recent/:amount", pc.getRecentProfiles); 
router.delete("/delete/:name/:id", pc.deleteProfile); //need to have a check if current token id matches profile user id?

export default router;
