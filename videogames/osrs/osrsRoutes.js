import express from "express";
import { upload } from "../../middleware/multerMiddleware.js";
import * as osrs from "./osrsController.js";

const router = express.Router();

router.post("/test", upload.single("file"), osrs.osrsTest);

export default router;
