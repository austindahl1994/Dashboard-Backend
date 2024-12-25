import express from "express";
import * as pc from "./profileController.js";

const router = express.Router();

router.get("/", pc.profileHome);
router.post("/create/:user_id", pc.createProfile)
router.get("/:user_id/:name/:id", pc.getProfile);
router.get("/recent/:user_id/:amount", pc.getRecentProfiles); 
router.delete("/delete/:user_id/:name", pc.deleteProfile); //need to have a check if current token id matches profile user id?

export default router;
