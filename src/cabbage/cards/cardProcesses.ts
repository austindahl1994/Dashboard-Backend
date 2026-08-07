import BossData from "./files/Boss.v1.json" with { type: "json" };
import ClueData from "./files/Clue.v1.json" with { type: "json" };
import MonsterData from "./files/Monster.v1.json" with { type: "json" };
import NpcData from "./files/Npc.v1.json" with { type: "json" };
import PackData from "./files/PackData.json" with { type: "json" };
import {
  normalizeCardKey,
  packsByBosses,
  resolveCardName,
  resolvePackName,
} from "./globalCards.ts";

const bossData = BossData;
const packData = PackData;
export const DEFAULT_PACK_CARD_QUANTITY = 5;

const SHINY_CHANCE = 0.05;
const NEGATIVE_CHANCE = 0.01;

const RARITY_WEIGHTS = {
  0: 58,
  1: 24,
  2: 10,
  3: 5,
  4: 2.4,
  5: 0.8,
  6: 0.1,
} as const;

type BossCardEntry = {
  items?: PackCardLike[];
  region?: string | null;
};

type MonsterCardEntry = {
  items?: PackCardLike[];
  region?: string | null;
};

type PackCardLike = {
  name: string;
  rarity?: number;
  type?: string;
  url?: string;
  description?: string;
  shiny?: boolean;
};

type ClueDataFile = Record<string, PackCardLike[]>;
type NpcDataFile = Record<string, PackCardLike[]>;

type PackConfig = {
  cost?: number;
};

type PackDataFile = {
  defaultCost: number;
  packs: Record<string, PackConfig>;
};

import type {
  CardFinish,
  CardInventory,
  CollectedCard,
  OpenedCard,
  PackCard,
  PackCardRarity,
  Packs,
} from "./cardTypes.js";

type CardInventoryRow = {
  cabbageId: number;
  coins: number;
  packName: string | null;
  quantity: number | null;
};

type CollectedCardRow = {
  id: number;
  cabbageId: number;
  cardName: string;
  quantity: number;
  shinyQuantity: number;
  negativeQuantity: number;
  lastObtainedAt: Date | null;
};

type PersistedOpenedCardRow = {
  cardName: string;
  quantity: number;
  shinyQuantity: number;
  negativeQuantity: number;
};

const clampRarity = (rarity: number): PackCardRarity => {
  const normalizedRarity = Number.isFinite(rarity) ? Math.floor(rarity) : 0;

  if (normalizedRarity <= 0) {
    return 0;
  }

  if (normalizedRarity >= 6) {
    return 6;
  }

  return normalizedRarity as PackCardRarity;
};

const getRarityWeight = (rarity: number): number => {
  return RARITY_WEIGHTS[clampRarity(rarity)] ?? 1;
};

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

      packsByBosses.set(bossName.toLowerCase(), {
        bossPack: bossName.toLowerCase(),
        extraPack: region.toLowerCase(),
        coins: packConfig?.cost ?? defaultCost,
      });
    }
    // console log the packs data, each on separate line
    // for (const [bossName, pack] of packsByBosses) {
    //   console.log(`${bossName}:`, pack);
    // }
    return packsByBosses;
  } catch (error) {
    return new Map();
  }
};

export const getPackReward = (bossName: string): Packs | null => {
  return (
    packsByBosses?.get(normalizeCardKey(bossName)) ??
    generatePacks().get(normalizeCardKey(bossName)) ??
    null
  );
};

export const getAllPackCosts = (): Record<string, number> => {
  const { defaultCost, packs } = packData as PackDataFile;
  const packCosts: Record<string, number> = {};

  for (const [packName, config] of Object.entries(packs)) {
    packCosts[packName] = config?.cost ?? defaultCost;
  }

  return packCosts;
};

const toPackCard = (card: PackCardLike, fallbackType: string): PackCard => ({
  name: card.name,
  rarity: Number(card.rarity ?? 0),
  type: card.type ?? fallbackType,
  url: card.url,
  description: card.description,
  shiny: Boolean(card.shiny),
});

const getRegionCards = (regionName: string): PackCard[] => {
  const normalizedRegion = normalizeCardKey(regionName);
  const regionCards: PackCard[] = [];

  for (const entry of Object.values(
    bossData as Record<string, BossCardEntry>,
  )) {
    if (normalizeCardKey(entry.region ?? "") !== normalizedRegion) {
      continue;
    }

    for (const item of entry.items ?? []) {
      regionCards.push(toPackCard(item, "boss"));
    }
  }

  for (const entry of Object.values(
    MonsterData as Record<string, MonsterCardEntry>,
  )) {
    if (normalizeCardKey(entry.region ?? "") !== normalizedRegion) {
      continue;
    }

    for (const item of entry.items ?? []) {
      regionCards.push(toPackCard(item, "monster"));
    }
  }

  return regionCards;
};

export const getPackCards = (packName: string): PackCard[] => {
  const canonicalPackName = resolvePackName(packName);
  const bossEntry = (bossData as Record<string, BossCardEntry>)[
    canonicalPackName
  ];

  if (bossEntry?.items?.length) {
    return bossEntry.items.map((item) => toPackCard(item, "boss"));
  }

  const monsterEntry = (MonsterData as Record<string, MonsterCardEntry>)[
    canonicalPackName
  ];

  if (monsterEntry?.items?.length) {
    return monsterEntry.items.map((item) => toPackCard(item, "monster"));
  }

  if (canonicalPackName.endsWith(" Clue")) {
    const clueTier = canonicalPackName.replace(/\s+Clue$/, "");
    const clueCards = (ClueData as ClueDataFile)[clueTier] ?? [];
    return clueCards.map((item) => toPackCard(item, "clue"));
  }

  const npcCards = (NpcData as NpcDataFile)[canonicalPackName];
  if (npcCards?.length) {
    return npcCards.map((item) => toPackCard(item, "npc"));
  }

  return getRegionCards(canonicalPackName);
};

export const getCompletionCoins = (bossName: string): number => {
  return (
    getPackReward(bossName)?.coins ?? (packData as PackDataFile).defaultCost
  );
};

export const getCompletionPackNames = (bossName: string): string[] => {
  const reward = getPackReward(bossName);

  if (!reward) {
    return [];
  }

  return [reward.bossPack, reward.extraPack].filter(Boolean);
};

export const getPackPurchaseCost = (packName: string, quantity = 1): number => {
  const { defaultCost, packs } = packData as PackDataFile;
  let unitCost = defaultCost;

  try {
    const canonicalPackName = resolvePackName(packName);
    unitCost = packs[canonicalPackName]?.cost ?? defaultCost;
  } catch {
    unitCost = defaultCost;
  }

  return Math.max(1, Math.floor(quantity || 1)) * unitCost;
};

export const canAffordPackPurchase = (
  currentCoins: number,
  packName: string,
  quantity = 1,
): boolean => {
  return currentCoins >= getPackPurchaseCost(packName, quantity);
};

export const getRemainingCoinsAfterPurchase = (
  currentCoins: number,
  packName: string,
  quantity = 1,
): number => {
  return Math.max(0, currentCoins - getPackPurchaseCost(packName, quantity));
};

export const mapInventoryRows = (rows: CardInventoryRow[]): CardInventory => {
  const baseRow = rows[0];

  return {
    cabbageId: Number(baseRow?.cabbageId ?? 0),
    coins: Number(baseRow?.coins ?? 0),
    packs: rows
      .filter((row) => row.packName)
      .map((row) => ({
        packName: row.packName as string,
        quantity: Number(row.quantity ?? 0),
      })),
  };
};

export const mapCollectedCardRows = (
  rows: CollectedCardRow[],
): CollectedCard[] => {
  return rows.map((row) => ({
    id: Number(row.id),
    cabbageId: Number(row.cabbageId),
    cardName: row.cardName,
    quantity: Number(row.quantity),
    shinyQuantity: Number(row.shinyQuantity),
    negativeQuantity: Number(row.negativeQuantity),
    lastObtainedAt: row.lastObtainedAt,
  }));
};

export const mapOpenedCardsForPersistence = (
  openedCards: OpenedCard[],
): PersistedOpenedCardRow[] => {
  const aggregatedCards = new Map<string, PersistedOpenedCardRow>();

  for (const openedCard of openedCards) {
    const canonicalCardName = resolveCardName(openedCard.name);
    const existingEntry = aggregatedCards.get(canonicalCardName);

    if (existingEntry) {
      existingEntry.quantity += 1;
      if (openedCard.finish === "shiny") {
        existingEntry.shinyQuantity += 1;
      }
      if (openedCard.finish === "negative") {
        existingEntry.negativeQuantity += 1;
      }
      continue;
    }

    aggregatedCards.set(canonicalCardName, {
      cardName: canonicalCardName,
      quantity: 1,
      shinyQuantity: openedCard.finish === "shiny" ? 1 : 0,
      negativeQuantity: openedCard.finish === "negative" ? 1 : 0,
    });
  }

  return Array.from(aggregatedCards.values());
};

export const weightedPickIndex = (cards: PackCard[]): number => {
  const totalWeight = cards.reduce(
    (sum, card) => sum + getRarityWeight(card.rarity),
    0,
  );

  if (totalWeight <= 0) {
    return Math.floor(Math.random() * cards.length);
  }

  let roll = Math.random() * totalWeight;

  for (let index = 0; index < cards.length; index += 1) {
    roll -= getRarityWeight(cards[index].rarity);
    if (roll <= 0) {
      return index;
    }
  }

  return cards.length - 1;
};

export const pickWeightedCards = (
  cards: PackCard[],
  count: number,
): PackCard[] => {
  if (!cards.length || count <= 0) {
    return [];
  }

  const selected: PackCard[] = [];
  const pool = [...cards];

  while (pool.length > 0 && selected.length < count) {
    const index = weightedPickIndex(pool);
    selected.push(pool[index]);
    pool.splice(index, 1);
  }

  while (selected.length < count) {
    const index = weightedPickIndex(cards);
    selected.push(cards[index]);
  }

  return selected;
};

export const applyFinish = (cards: PackCard[]): OpenedCard[] => {
  return cards.map((card) => {
    const isAlwaysShinyBaseCard =
      Boolean(card.shiny) &&
      clampRarity(card.rarity) === 6 &&
      card.type === "boss";

    const finish: CardFinish =
      Math.random() < NEGATIVE_CHANCE
        ? "negative"
        : isAlwaysShinyBaseCard || Math.random() < SHINY_CHANCE
          ? "shiny"
          : "normal";

    if (finish === "negative") {
      return {
        ...card,
        rarity: clampRarity(card.rarity) + 1,
        finish,
        shiny: true,
      };
    }

    return {
      ...card,
      rarity: clampRarity(card.rarity) + 1,
      finish,
      shiny: finish !== "normal",
    };
  });
};

export const openPack = (
  possibleCards: PackCard[],
  cardQuantity = DEFAULT_PACK_CARD_QUANTITY,
): OpenedCard[] => {
  const selectedCards = pickWeightedCards(
    possibleCards,
    Math.max(1, Math.floor(cardQuantity || 1)),
  );

  return applyFinish(selectedCards);
};
