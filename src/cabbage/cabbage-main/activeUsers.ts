import type { Response } from "express";
import { randomUUID } from "node:crypto";
import {
  adventurerData,
  floorData,
  towerFloorsData,
} from "../tower/towerGlobalData.ts";

type ActiveSseUser = {
  connectionId: string;
  discordId: string;
  playerName: string;
  connectedAt: number;
  lastSeenAt: number;
  res: Response;
};

const activeUsers = new Map<string, ActiveSseUser>();

type ActiveSseUserView = {
  connectionId: string;
  discordId: string;
  playerName: string;
  connectedAt: number;
  lastSeenAt: number;
};

export const setupSse = (res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
};

const writeSseEvent = (
  res: Response,
  eventType: string,
  payload: unknown,
  eventId?: string,
) => {
  if (eventId) {
    res.write(`id: ${eventId}\n`);
  }

  res.write(`event: ${eventType}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const logSsePayload = (
  eventType: string,
  payload: unknown,
  destination: string,
) => {
  if (eventType === "tower-completions") {
    const data = payload as {
      rsn?: string;
      completions?: Array<{ rsn?: string; item?: string; floor?: number }>;
    };

    const latestCompletion = data.completions?.[0];
    const rsn = latestCompletion?.rsn ?? data.rsn ?? "unknown";
    const item = latestCompletion?.item ?? "";
    const floor = latestCompletion?.floor;

    // console.log(
    //   `[SSE OUT] ADVENTURER updated destination=${destination} rsn=${rsn} item=${item || "none"} floor=${floor ?? "unknown"}`,
    // );
    return;
  }

  if (eventType === "tower-state") {
    const data = payload as {
      towerFloorsUpdated?: boolean;
      towerFloors?: Array<{ floor?: number; rsn?: string; item?: string }>;
      adventurers?: Array<{ rsn?: string; item?: string }>;
    };

    if (data.towerFloorsUpdated) {
      const latestTowerFloor =
        data.towerFloors?.[data.towerFloors.length - 1] ??
        data.towerFloors?.[0];

      // console.log(
      //   `[SSE OUT] TOWERFLOOR updated destination=${destination} floor=${latestTowerFloor?.floor ?? "unknown"} rsn=${latestTowerFloor?.rsn ?? "unknown"} item=${latestTowerFloor?.item ?? "none"} trackedFloors=${data.towerFloors?.length ?? 0}`,
      // );
      return;
    }

    const firstAdventurer = data.adventurers?.[0];
    // console.log(
    //   `[SSE OUT] ADVENTURER snapshot destination=${destination} count=${data.adventurers?.length ?? 0} sampleRsn=${firstAdventurer?.rsn ?? "unknown"} sampleItem=${firstAdventurer?.item ?? "none"}`,
    // );
  }
};

export const addActiveUser = (
  res: Response,
  discordId?: string,
  playerName?: string,
) => {
  const connectionId = randomUUID();
  const resolvedUserId = (discordId ?? "anonymous").trim() || "anonymous";
  const resolvedPlayerName =
    (playerName ?? resolvedUserId).trim() || "anonymous";

  const user: ActiveSseUser = {
    connectionId,
    discordId: resolvedUserId,
    playerName: resolvedPlayerName,
    connectedAt: Date.now(),
    lastSeenAt: Date.now(),
    res,
  };

  activeUsers.set(connectionId, user);

  writeSseEvent(res, "connected", {
    connectionId,
    discordId: resolvedUserId,
    playerName: resolvedPlayerName,
    activeUsers: activeUsers.size,
  });

  return connectionId;
};

export const removeActiveUser = (connectionId: string) => {
  activeUsers.delete(connectionId);
};

export const getActiveUsers = () => {
  return Array.from(activeUsers.values()).map((user) => ({
    connectionId: user.connectionId,
    discordId: user.discordId,
    playerName: user.playerName,
    connectedAt: user.connectedAt,
    lastSeenAt: user.lastSeenAt,
  }));
};

export const broadcastSseEvent = (eventType: string, payload: unknown) => {
  const eventId = randomUUID();
  logSsePayload(eventType, payload, "broadcast:all");

  for (const [connectionId, user] of activeUsers.entries()) {
    try {
      user.lastSeenAt = Date.now();
      writeSseEvent(user.res, eventType, payload, eventId);
    } catch (error) {
      console.log(`Failed to broadcast to ${connectionId}: ${error}`);
      activeUsers.delete(connectionId);
    }
  }
};

export const singleBroadcastSseEvent = (
  discordId: string,
  eventType: string,
  payload: unknown,
) => {
  const eventId = randomUUID();
  let deliveredCount = 0;

  const isCardsGenerateRewardEvent =
    eventType === "tower-reward" &&
    typeof payload === "object" &&
    payload !== null &&
    (payload as { reason?: string }).reason === "cards-generate";

  if (isCardsGenerateRewardEvent) {
    console.log(
      `[SSE][cards-generate] dispatch start discordId=${discordId} activeConnections=${activeUsers.size}`,
    );
  }

  logSsePayload(eventType, payload, `broadcast:discordId=${discordId}`);

  for (const [connectionId, user] of activeUsers.entries()) {
    if (user.discordId !== discordId) {
      continue;
    }

    try {
      user.lastSeenAt = Date.now();
      writeSseEvent(user.res, eventType, payload, eventId);
      deliveredCount += 1;

      if (isCardsGenerateRewardEvent) {
        console.log(
          `[SSE][cards-generate] sent connectionId=${connectionId} discordId=${discordId}`,
        );
      }
    } catch (error) {
      console.log(`Failed to broadcast to ${connectionId}: ${error}`);

      if (isCardsGenerateRewardEvent) {
        console.log(
          `[SSE][cards-generate] failed connectionId=${connectionId} discordId=${discordId} error=${error}`,
        );
      }

      activeUsers.delete(connectionId);
    }
  }

  if (isCardsGenerateRewardEvent) {
    console.log(
      `[SSE][cards-generate] dispatch complete discordId=${discordId} delivered=${deliveredCount}`,
    );
  }

  return deliveredCount;
};

export const broadcastSseEventPerUser = (
  eventType: string,
  buildPayload: (user: ActiveSseUserView) => unknown,
) => {
  const eventId = randomUUID();

  for (const [connectionId, user] of activeUsers.entries()) {
    try {
      user.lastSeenAt = Date.now();
      const payload = buildPayload({
        connectionId: user.connectionId,
        discordId: user.discordId,
        playerName: user.playerName,
        connectedAt: user.connectedAt,
        lastSeenAt: user.lastSeenAt,
      });
      logSsePayload(
        eventType,
        payload,
        `broadcast:connectionId=${user.connectionId}:discordId=${user.discordId}`,
      );
      writeSseEvent(user.res, eventType, payload, eventId);
    } catch (error) {
      console.log(`Failed to broadcast to ${connectionId}: ${error}`);
      activeUsers.delete(connectionId);
    }
  }
};

export const broadcastAllActiveUsers = () => {};

let towerSseTestInterval: ReturnType<typeof setInterval> | null = null;

type TowerSseTestPlayer = {
  id: number;
  rsn: string;
  currentFloor: number;
  item: string;
  discordId: string | null;
  discordAvatar: string | null;
};

type TowerSseTestCompletion = {
  cabbageId: number;
  id: number;
  floor: number;
  rsn: string;
  completedAt: string;
  url: string;
  item: string;
};

const getRandomEntry = <T>(entries: T[]): T | null => {
  if (entries.length === 0) {
    return null;
  }

  return entries[Math.floor(Math.random() * entries.length)] ?? null;
};

const getCachedFloorOptions = () => {
  return Array.from(floorData.entries())
    .map(([floor, placements]) => ({
      floor,
      items: Array.from(placements.items),
    }))
    .filter((entry) => entry.items.length > 0);
};

const buildTestPlayers = (): TowerSseTestPlayer[] => {
  const cachedAdventurers = Array.from(adventurerData.values());
  const actualAdventurer =
    getRandomEntry(cachedAdventurers) ?? cachedAdventurers[0] ?? null;

  const actualPlayer: TowerSseTestPlayer = actualAdventurer
    ? {
        id: actualAdventurer.id,
        rsn: actualAdventurer.rsn,
        currentFloor: 0,
        item: actualAdventurer.item,
        discordId: actualAdventurer.discordId ?? null,
        discordAvatar: actualAdventurer.discordAvatar ?? null,
      }
    : {
        id: 9000,
        rsn: "Actual Cached Adventurer",
        currentFloor: 0,
        item: "",
        discordId: null,
        discordAvatar: null,
      };

  const fakePlayers: TowerSseTestPlayer[] = [
    {
      id: 9001,
      rsn: "Tower Test Ada",
      currentFloor: 0,
      item: "",
      discordId: "tower-test-ada",
      discordAvatar: "https://example.com/avatar/tower-test-ada.png",
    },
    {
      id: 9002,
      rsn: "Tower Test Bram",
      currentFloor: 0,
      item: "",
      discordId: "tower-test-bram",
      discordAvatar: "https://example.com/avatar/tower-test-bram.png",
    },
  ];

  return [actualPlayer, ...fakePlayers];
};

export const startTowerSseTestBroadcast = (intervalMs = 5_000) => {
  if (towerSseTestInterval) {
    return;
  }

  let testSequence = 0;
  const testPlayers = buildTestPlayers();
  const floorOptions = getCachedFloorOptions();
  const towerFloorsSeen = new Map<number, TowerSseTestCompletion>();
  const completionHistoryByPlayer = new Map<number, TowerSseTestCompletion[]>();

  const buildTowerStatePayload = () => {
    const towerFloors = Array.from(towerFloorsSeen.values())
      .sort((a, b) => a.floor - b.floor)
      .map((completion) => ({
        cabbageId: completion.cabbageId,
        floor: completion.floor,
        rsn: completion.rsn,
        item: completion.item,
        url: completion.url,
      }));

    const adventurers = testPlayers.map((player) => ({ ...player }));

    return {
      isTest: true,
      sequence: testSequence,
      playerData: adventurers,
      adventurers,
      towerFloors,
      towerFloorsUpdated: false,
    };
  };

  const syncTestStateToTowerCache = () => {
    for (const player of testPlayers) {
      adventurerData.set(player.id, {
        id: player.id,
        rsn: player.rsn,
        currentFloor: player.currentFloor,
        item: player.item,
        discordId: player.discordId,
        discordAvatar: player.discordAvatar,
      });
    }

    const nextTowerFloors = Array.from(towerFloorsSeen.values())
      .sort((a, b) => a.floor - b.floor)
      .map((completion) => ({
        cabbageId: completion.cabbageId,
        floor: completion.floor,
        rsn: completion.rsn,
        item: completion.item,
        url: completion.url,
      }));

    towerFloorsData.splice(0, towerFloorsData.length, ...nextTowerFloors);
  };

  const buildRandomCompletion = (player: TowerSseTestPlayer) => {
    const floorToComplete = player.currentFloor;
    const floorChoice = floorOptions.find(
      (entry) => entry.floor === floorToComplete,
    ) ??
      getRandomEntry(floorOptions) ?? {
        floor: floorToComplete,
        items: [],
      };

    const selectedFloor = floorChoice.floor;
    const selectedItem = getRandomEntry(floorChoice.items);
    const completedAt = "Datetime";
    const completion: TowerSseTestCompletion = {
      cabbageId: player.id,
      id: 12000 + testSequence,
      floor: selectedFloor,
      rsn: player.rsn,
      completedAt,
      url: `https://example.com/tower/${player.discordId ?? player.rsn}/${testSequence}.png`,
      item: selectedItem ?? "",
    };

    player.currentFloor = selectedFloor + 1;
    player.item = completion.item;

    const towerFloorsUpdated = !towerFloorsSeen.has(selectedFloor);
    if (towerFloorsUpdated) {
      towerFloorsSeen.set(selectedFloor, completion);
    }

    const reachedMaxFloor = selectedFloor >= 10;
    if (reachedMaxFloor) {
      for (const testPlayer of testPlayers) {
        testPlayer.currentFloor = 0;
        testPlayer.item = "";
      }

      towerFloorsSeen.clear();
      completionHistoryByPlayer.clear();
    }

    return { completion, towerFloorsUpdated };
  };

  const sendTowerTestPayloads = () => {
    testSequence += 1;

    const fakePlayers = testPlayers.filter((player) => player.id >= 9001);
    const progressionCandidates =
      towerFloorsSeen.size === 0 && fakePlayers.length > 0
        ? fakePlayers
        : testPlayers;

    const selectedPlayer =
      getRandomEntry(progressionCandidates) ?? getRandomEntry(testPlayers);

    if (selectedPlayer) {
      const { completion, towerFloorsUpdated } =
        buildRandomCompletion(selectedPlayer);

      const existingHistory =
        completionHistoryByPlayer.get(completion.cabbageId) ?? [];
      const nextHistory = [completion, ...existingHistory];
      completionHistoryByPlayer.set(completion.cabbageId, nextHistory);
      syncTestStateToTowerCache();

      broadcastSseEvent("tower-state", {
        ...buildTowerStatePayload(),
        towerFloorsUpdated,
      });

      const connectedRecipient = Array.from(activeUsers.values())[0];
      if (connectedRecipient) {
        singleBroadcastSseEvent(
          connectedRecipient.discordId,
          "tower-completions",
          {
            isTest: true,
            cabbageId: completion.cabbageId,
            rsn: completion.rsn,
            completedBy: completion.rsn,
            completions: nextHistory.map((entry) => ({
              id: entry.id,
              cabbageId: entry.cabbageId,
              floor: entry.floor,
              rsn: entry.rsn,
              item: entry.item,
              url: entry.url,
              completedAt: entry.completedAt,
            })),
          },
        );
      }
      return;
    }

    syncTestStateToTowerCache();
    broadcastSseEvent("tower-state", buildTowerStatePayload());
  };

  sendTowerTestPayloads();
  towerSseTestInterval = setInterval(sendTowerTestPayloads, intervalMs);
  towerSseTestInterval.unref();
};

export const stopTowerSseTestBroadcast = () => {
  if (!towerSseTestInterval) {
    return;
  }

  clearInterval(towerSseTestInterval);
  towerSseTestInterval = null;
};

// Send keep-alive comments every 30 seconds to prevent proxy/load balancer timeouts
const keepAliveInterval = setInterval(() => {
  for (const [connectionId, user] of activeUsers.entries()) {
    try {
      user.res.write(": keep-alive\n\n"); // Comment line in SSE format
    } catch (error) {
      console.log(`Failed to send keep-alive to ${connectionId}: ${error}`);
      activeUsers.delete(connectionId);
    }
  }
}, 30_000); // 30 seconds

keepAliveInterval.unref();
