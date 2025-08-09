import app from "./app.js";
import { startBot } from "./bot/mainBot.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

startBot().catch((err) => {
  console.error("Failed to start bot:", err);
});

function gracefulShutdown() {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
