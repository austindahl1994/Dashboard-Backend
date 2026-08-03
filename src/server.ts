import app from "./app.js";
import { startBot } from "./bot/mainBot.js";
import {
  CabbageUsers,
  initializeGlobalCabbageData,
} from "./cabbage/cabbage-main/globalCabbage.ts";
// TEMP: SSE test broadcaster disabled
// import { startTowerSseTestBroadcast } from "./cabbage/cabbage-main/activeUsers.ts";
import {
  adventurerData,
  initializeTowerData,
} from "./cabbage/tower/towerGlobalData.ts";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

let server;

async function bootstrap() {
  try {
    await startBot();
    await initializeGlobalCabbageData();
    await initializeTowerData();

    console.log(
      "[Cache Init] Cabbage users:",
      CabbageUsers.map((user) => ({
        id: user.id,
        rsn: user.rsn,
        discord_id: user.discord_id,
        role: user.role,
      })),
    );

    console.log(
      "[Cache Init] Adventurer users:",
      Array.from(adventurerData.values()).map((adventurer) => ({
        adventurerId: adventurer.id,
        cabbageId: adventurer.id,
        rsn: adventurer.rsn,
        currentFloor: adventurer.currentFloor,
        discordId: adventurer.discordId ?? null,
      })),
    );

    server = app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);

      // TEMP: SSE test broadcaster disabled
      // if (process.env.NODE_ENV !== "production") {
      //   startTowerSseTestBroadcast();
      //   console.log("[SSE Test] Tower SSE test broadcaster is enabled.");
      // }
    });
  } catch (err) {
    console.error("Failed to start application:", err);
    process.exit(1);
  }
}

bootstrap();

function gracefulShutdown() {
  console.log("Shutting down server...");
  if (!server) {
    process.exit(0);
    return;
  }

  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
