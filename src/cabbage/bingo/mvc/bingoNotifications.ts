import type { DiscordEmbed } from "@/types/index.ts";
import { postToDiscordChannel } from "@/services/discord/postToChannel.ts";
import type { BingoSignup } from "./bingo.ts";

const LIVE_BUY_INS_CHANNEL_ID = "1552860361969893386";
const TEST_BUY_INS_CHANNEL_ID = "1552861933525536858";

const BUY_IN_PER_PERSON = 11_000_000;

// Matches the bot's convention in src/bot/mainBot.js
const isProduction = () => process.env.ENVIRONMENT === "production";

const getBuyInsChannelId = (): string =>
  isProduction() ? LIVE_BUY_INS_CHANNEL_ID : TEST_BUY_INS_CHANNEL_ID;

const formatGp = (amount: number): string => {
  if (!Number.isFinite(amount) || amount <= 0) return "0";

  if (amount >= 1_000_000_000) {
    return `${Number((amount / 1_000_000_000).toFixed(2))}b`;
  }

  if (amount >= 1_000_000) {
    return `${Number((amount / 1_000_000).toFixed(2))}m`;
  }

  if (amount >= 1_000) {
    return `${Number((amount / 1_000).toFixed(2))}k`;
  }

  return `${amount}`;
};

const buildSignupEmbed = (signup: BingoSignup, totalOwed: number) => {
  const coveredPlayers = signup.coveredPlayers ?? [];
  const peopleCount = 1 + coveredPlayers.length;

  const fields: NonNullable<DiscordEmbed["fields"]> = [
    { name: "RSN", value: signup.rsn, inline: true },
    {
      name: "Intended Hours",
      value: `${signup.intendedHours}`,
      inline: true,
    },
    {
      name: "Donation",
      value: `${formatGp(signup.donation)} gp`,
      inline: true,
    },
    {
      name: `Covered Players (${coveredPlayers.length})`,
      value: coveredPlayers.length ? coveredPlayers.join(", ") : "None",
      inline: false,
    },
    {
      name: "Total Owed",
      value: `${formatGp(totalOwed)} gp (${peopleCount} x ${formatGp(
        BUY_IN_PER_PERSON,
      )} buy-in + ${formatGp(signup.donation)} donation)`,
      inline: false,
    },
  ];

  if (signup.notes) {
    fields.push({
      name: "Notes",
      value: signup.notes.slice(0, 1024),
      inline: false,
    });
  }

  const embed: DiscordEmbed = {
    title: `New Bingo Signup: ${signup.rsn}`,
    color: 0x2ecc71,
    timestamp: new Date().toISOString(),
    footer: { text: "Bingo Buy-Ins" },
    fields,
  };

  return embed;
};

export const notifyBingoSignup = async (signup: BingoSignup): Promise<void> => {
  const coveredPlayers = signup.coveredPlayers ?? [];
  const totalOwed =
    (1 + coveredPlayers.length) * BUY_IN_PER_PERSON + (signup.donation ?? 0);

  await postToDiscordChannel(
    getBuyInsChannelId(),
    buildSignupEmbed(signup, totalOwed),
  );
};
