import express from "express";
import * as ac from "./authController.js";

const router = express.Router();

router.post("/login", ac.login);
router.post('/logout', ac.logout)

export default router;
