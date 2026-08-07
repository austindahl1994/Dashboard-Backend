import BossData from "./files/Boss.v1.json" with { type: "json" };
import ClueData from "./files/Clue.v1.json" with { type: "json" };
import MonsterData from "./files/Monster.v1.json" with { type: "json" };
import NpcData from "./files/Npc.v1.json" with { type: "json" };
import PackData from "./files/PackData.json" with { type: "json" };
import { generatePacks } from "./cardProcesses.ts";
import type { Packs } from "./cardTypes.js";

type NameOnly = {
  name: string;
};

type GroupedCardEntry = {
  items?: NameOnly[];
};

type GroupedCardFile = Record<string, GroupedCardEntry>;
type ArrayCardFile = Record<string, NameOnly[]>;

type PackDataFile = {
  packs: Record<string, unknown>;
};

export let packsByBosses: Map<string, Packs>;
export let packNameLookup = new Map<string, string>();
export let cardNameLookup = new Map<string, string>();

export const normalizeCardKey = (value: string): string =>
  value.trim().toLowerCase();

const addLookupName = (
  lookup: Map<string, string>,
  value: string | undefined,
) => {
  if (!value) {
    return;
  }

  const normalizedValue = normalizeCardKey(value);
  if (!normalizedValue || lookup.has(normalizedValue)) {
    return;
  }

  lookup.set(normalizedValue, value.trim());
};

const buildCardNameLookup = (): Map<string, string> => {
  const lookup = new Map<string, string>();
  const bossEntries = Object.entries(BossData as GroupedCardFile);
  const monsterEntries = Object.entries(MonsterData as GroupedCardFile);
  const clueEntries = Object.values(ClueData as ArrayCardFile);
  const npcEntries = Object.values(NpcData as ArrayCardFile);

  for (const [groupName, groupEntry] of bossEntries) {
    addLookupName(lookup, groupName);
    for (const item of groupEntry.items ?? []) {
      addLookupName(lookup, item.name);
    }
  }

  for (const [groupName, groupEntry] of monsterEntries) {
    addLookupName(lookup, groupName);
    for (const item of groupEntry.items ?? []) {
      addLookupName(lookup, item.name);
    }
  }

  for (const clueGroup of clueEntries) {
    for (const item of clueGroup) {
      addLookupName(lookup, item.name);
    }
  }

  for (const npcGroup of npcEntries) {
    for (const item of npcGroup) {
      addLookupName(lookup, item.name);
    }
  }

  return lookup;
};

const buildPackNameLookup = (): Map<string, string> => {
  return new Map<string, string>(
    Object.keys((PackData as PackDataFile).packs).map((packName) => [
      normalizeCardKey(packName),
      packName,
    ]),
  );
};

export const resolvePackName = (packName: string): string => {
  const canonicalPackName = packNameLookup.get(normalizeCardKey(packName));

  if (!canonicalPackName) {
    throw new Error(`Unknown pack name: ${packName}`);
  }

  return canonicalPackName;
};

export const resolveCardName = (cardName: string): string => {
  const canonicalCardName = cardNameLookup.get(normalizeCardKey(cardName));

  if (!canonicalCardName) {
    throw new Error(`Unknown card name: ${cardName}`);
  }

  return canonicalCardName;
};

export const initializeGlobalCards = async () => {
  try {
    packsByBosses = generatePacks();
    packNameLookup = buildPackNameLookup();
    cardNameLookup = buildCardNameLookup();
  } catch (error) {}
};
