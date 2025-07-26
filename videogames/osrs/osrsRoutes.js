import express from "express";
import { upload } from "../../middleware/multerMiddleware.js";
import * as osrs from "./osrsController.js";

const router = express.Router();

router.post("/CabbageBounty", upload.single("file"), osrs.osrsController);

export default router;
