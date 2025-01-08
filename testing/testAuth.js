import express from "express";

const router = express.Router();

router.get("/check-session", (req, res) => {
    console.log(`Checked session in test route/controller`)
  return res.status(200).json({ message: `User is authenticated` });
});

export default router;
