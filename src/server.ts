import app from "./app.js";
import { startBot } from "./bot/mainBot.js";
import { initializeGlobalCabbageData } from "./cabbage/cabbage-main/globalCabbage.ts";
import { initializeGlobalCards } from "./cabbage/cards/globalCards.ts";
// TEMP: SSE test broadcaster disabled
// import { startTowerSseTestBroadcast } from "./cabbage/cabbage-main/activeUsers.ts";
import { initializeTowerData } from "./cabbage/tower/towerGlobalData.ts";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;
const STARTUP_INIT_DELAY_MS = Number(process.env.STARTUP_INIT_DELAY_MS ?? 2000);

let server: ReturnType<typeof app.listen> | undefined;
let backgroundInitializationStarted = false;

const initializeBackgroundServices = async () => {
  if (backgroundInitializationStarted) {
    return;
  }

  backgroundInitializationStarted = true;

  try {
    console.log(
      `[startup] Deferring background initialization for ${STARTUP_INIT_DELAY_MS}ms`,
    );

    await new Promise((resolve) => setTimeout(resolve, STARTUP_INIT_DELAY_MS));

    const results = await Promise.allSettled([
      startBot(),
      initializeGlobalCabbageData(),
      initializeTowerData(),
      initializeGlobalCards(),
    ]);

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Background initialization ${index} failed:`,
          result.reason,
        );
      }
    });
  } catch (error) {
    console.error("Background initialization failed:", error);
  }
};

async function bootstrap() {
  try {
    server = app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);

      // TEMP: SSE test broadcaster disabled
      // if (process.env.NODE_ENV !== "production") {
      //   startTowerSseTestBroadcast();
      //   console.log("[SSE Test] Tower SSE test broadcaster is enabled.");
      // }
    });

    void initializeBackgroundServices();
  } catch (err) {
    console.error("Failed to start application:", err);
    process.exit(1);
  }
}

void bootstrap();

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
