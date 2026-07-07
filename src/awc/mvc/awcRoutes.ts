import express from "express";
import * as ac from "./awcController.ts";

const router = express.Router();

router.post("/login", ac.login);
router.get("/session", ac.session);

export default router;
