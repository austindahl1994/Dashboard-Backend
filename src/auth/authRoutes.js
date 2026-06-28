import express from "express";
import * as ac from "./authController.js";
import * as cc from "../cabbage/cabbage-main/mvc/cabbageController.js";
const router = express.Router();

router.post("/login", ac.login);
router.post("/refresh", ac.refresh);
router.post("/logout", ac.logout);

// Preferred endpoint: frontend posts the OAuth code here as JSON.
router.post("/discord/exchange", (req, res) => {
  // console.log("[Discord OAuth] /discord/exchange ");
  return cc.cabbageController(req, res);
});

// If Discord is configured to redirect directly to backend GET, return guidance.
router.get("/discord/redirect", (_req, res) => {
  return res.status(400).json({
    error: "Invalid Discord callback target.",
    details:
      "Use a frontend callback URL as Discord redirect_uri, then POST the received code to /auth/discord/exchange.",
  });
});

export default router;
