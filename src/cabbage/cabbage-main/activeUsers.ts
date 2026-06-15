import type { Response } from "express";
import { randomUUID } from "node:crypto";

type ActiveSseUser = {
  connectionId: string;
  userId: string;
  playerName: string;
  connectedAt: number;
  lastSeenAt: number;
  res: Response;
};

const activeUsers = new Map<string, ActiveSseUser>();

const TEST_BROADCAST_INTERVAL_MS = 60_000;
const TEST_PAYLOAD = { message: "server test" };

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

export const addActiveUser = (
  res: Response,
  userId?: string,
  playerName?: string,
) => {
  const connectionId = randomUUID();
  const resolvedUserId = (userId ?? "anonymous").trim() || "anonymous";
  const resolvedPlayerName =
    (playerName ?? resolvedUserId).trim() || "anonymous";

  const user: ActiveSseUser = {
    connectionId,
    userId: resolvedUserId,
    playerName: resolvedPlayerName,
    connectedAt: Date.now(),
    lastSeenAt: Date.now(),
    res,
  };

  activeUsers.set(connectionId, user);

  writeSseEvent(res, "connected", {
    connectionId,
    userId: resolvedUserId,
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
    userId: user.userId,
    playerName: user.playerName,
    connectedAt: user.connectedAt,
    lastSeenAt: user.lastSeenAt,
  }));
};

export const broadcastSseEvent = (eventType: string, payload: unknown) => {
  const eventId = randomUUID();

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

const interval = setInterval(() => {
  return; // Disable test broadcast for now
  if (activeUsers.size === 0) {
    // console.log(`There were no active players`);
    return;
  }
  // console.log(`Broadcasting message on minute interval...`);
  broadcastSseEvent("message", TEST_PAYLOAD);
}, TEST_BROADCAST_INTERVAL_MS);

interval.unref();
