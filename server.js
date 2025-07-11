import app from "./app.js";
import { startBot } from "./bot/mainBot.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

startBot().catch((err) => {
  console.error("Failed to start bot:", err);
});
