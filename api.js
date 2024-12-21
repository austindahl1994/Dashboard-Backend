import express from "express";
import pool from "./db/mysqlPool.js";
const router = express.Router();

router.get("/test", (req, res) => {
  console.log("Test called from frontend")
  res.send("Connection from backend is successful");
});

//Test api call
router.get('/user', async (req, res) => {
  const id = req.query.id;
  console.log(`get user called with id: ${id}`);
  try {
    const [result] = await pool.query(
      "SELECT user_name FROM users WHERE user_id = ?",
      [id]
    );
    console.log(`${result[0].user_name}`)
    if (result.length > 0) {
      res.json({user: result[0].user_name})
    } else {
      res.status(404).send("No user found")
    }
  } catch (error) {
    res.send(`Internal server error: ${error}`)
  }
})

export default router;