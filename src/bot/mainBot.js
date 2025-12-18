import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client, GatewayIntentBits, Collection } from "discord.js";
// import { refreshAllData } from "../vingo/cachedData.ts";
import dotenv from "dotenv";

dotenv.config();

const testEnv = process.env.TEST_ENV ?? false;
const token = process.env.DISCORD_BOT_TOKEN;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the client ONCE and export it
export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// @ts-ignore
client.commands = new Collection();
// @ts-ignore
client.cooldowns = new Collection();

export async function startBot() {
  // Load commands
  if (!testEnv) {
    console.log("⚠️  Starting bot in prod mode");
    // refreshAllData();
  }
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const commandModule = await import(`file://${filePath}`);
    const command = commandModule.default ?? commandModule;

    if ("data" in command && "execute" in command) {
      // @ts-ignore
      client.commands.set(command.data.name, command);
    } else {
      console.warn(
        `[WARNING] The command at ${filePath} is missing "data" or "execute".`
      );
    }
  }

  // Load events
  const eventsPath = path.join(__dirname, "events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const eventModule = await import(`file://${filePath}`);
    const event = eventModule.default ?? eventModule;

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  // Log in the bot
  await client.login(token);
  console.log("✅ Discord bot started.");
}
