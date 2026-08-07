import { generatePacks } from "./cardProcesses.ts";
import type { Packs } from "./cardTypes.js";

export let packsByBosses: Map<string, Packs>;

export const initializeGlobalCards = async () => {
  try {
    packsByBosses = generatePacks();
  } catch (error) {}
};
