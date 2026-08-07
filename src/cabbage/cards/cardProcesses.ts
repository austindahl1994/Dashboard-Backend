import BossData from "./files/Boss.v1.json" with { type: "json" };
import PackData from "./files/PackData.json" with { type: "json" };

const bossData = BossData;
const packData = PackData;

type BossCardEntry = {
  region?: string | null;
};

type PackConfig = {
  cost?: number;
};

type PackDataFile = {
  defaultCost: number;
  packs: Record<string, PackConfig>;
};

// Generate cards in packs based on what pack is being opened, and rarity based on card rarity generator. Save cards to database for that player with rsn, card ID, and quantity

// On completion, gives correct pack, regional pack as well if applicable, and GP value based on boss/monster tier * 300 (or something)
// NOTE: Could just be one pack of each, it's own pack + whatever other pack is in the group

// Buy packs with GP, decrement player GP, send SSE to player with new GP value and new pack count

// Generate GP based on what the boss or monster is that the drop is from, default is 100 gold if not on the PackData list

// Generate packs based on bosses, each boss would have a specific pack associated with it, a possible regions pack, and a gold value from the packdata
import type { Packs } from "./cardTypes.js";

export const generatePacks = (): Map<string, Packs> => {
  try {
    const packsByBosses: Map<string, Packs> = new Map();
    const bossEntries = Object.entries(
      bossData as Record<string, BossCardEntry>,
    );
    const { defaultCost, packs } = packData as PackDataFile;

    for (const [bossName, bossEntry] of bossEntries) {
      const region = bossEntry.region?.trim() ?? "";
      const packConfig = packs[bossName];

      packsByBosses.set(bossName, {
        bossPack: bossName,
        extraPack: region,
        coins: packConfig?.cost ?? defaultCost,
      });
    }

    return packsByBosses;
  } catch (error) {
    return new Map();
  }
};
