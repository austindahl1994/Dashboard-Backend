import type { Response } from "express";
import type { CabbageRequest } from "@/middleware/cabbageMiddleware.ts";
import { getCabbageIdFromRequest, sendError } from "@/cabbageUtilities.ts";
import {
  BINGO_SIGNUP_STATUSES,
  createBingoSignup,
  getAllBingoSignups,
  getBingoParticipants,
  getBingoSignupByCabbageId,
  normalizeRsnKey,
  updateBingoSignupStatus,
  type BingoSignup,
  type BingoSignupStatus,
} from "./bingo.ts";
import { fetchOsrsHiscores, normalizeRsn } from "@/services/osrs/hiscores.ts";
import { notifyBingoSignup } from "./bingoNotifications.ts";

const MAX_RSN_LENGTH = 12;
const MAX_COVERED_PLAYERS = 50;
const MAX_NOTES_LENGTH = 2000;
const MAX_INTENDED_HOURS = 1000;
const MAX_DONATION = 1_000_000_000_000;

type SignupValidation =
  | {
      ok: true;
      value: Omit<Parameters<typeof createBingoSignup>[0], "cabbageId">;
    }
  | { ok: false; message: string };

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

const validateSignupBody = (body: unknown): SignupValidation => {
  if (!body || typeof body !== "object") {
    return { ok: false, message: "Invalid signup payload" };
  }

  const payload = body as Record<string, unknown>;

  const rsn = typeof payload.rsn === "string" ? payload.rsn.trim() : "";
  if (!rsn || rsn.length > MAX_RSN_LENGTH) {
    return { ok: false, message: "RSN must be between 1 and 12 characters" };
  }

  if (!isNonNegativeInteger(payload.intendedHours)) {
    return {
      ok: false,
      message: "Intended hours must be a non-negative integer",
    };
  }

  if (payload.intendedHours > MAX_INTENDED_HOURS) {
    return { ok: false, message: "Intended hours is unrealistically high" };
  }

  if (typeof payload.payingForOthers !== "boolean") {
    return { ok: false, message: "Paying for others must be a boolean" };
  }

  if (!Array.isArray(payload.coveredPlayers)) {
    return { ok: false, message: "Covered players must be an array of RSNs" };
  }

  if (payload.coveredPlayers.length > MAX_COVERED_PLAYERS) {
    return { ok: false, message: "Too many covered players submitted" };
  }

  const coveredPlayers: string[] = [];
  for (const entry of payload.coveredPlayers) {
    if (typeof entry !== "string") {
      return { ok: false, message: "Covered players must be an array of RSNs" };
    }

    const trimmed = entry.trim();
    if (!trimmed) continue;

    if (trimmed.length > MAX_RSN_LENGTH) {
      return {
        ok: false,
        message: "Each covered player RSN must be between 1 and 12 characters",
      };
    }

    coveredPlayers.push(trimmed);
  }

  if (!payload.payingForOthers && coveredPlayers.length > 0) {
    return {
      ok: false,
      message: "Covered players must be empty when not paying for others",
    };
  }

  if (payload.payingForOthers && coveredPlayers.length === 0) {
    return {
      ok: false,
      message: "At least one covered player is required when paying for others",
    };
  }

  if (!isNonNegativeInteger(payload.donation)) {
    return { ok: false, message: "Donation must be a non-negative integer" };
  }

  if (payload.donation > MAX_DONATION) {
    return { ok: false, message: "Donation exceeds the maximum allowed value" };
  }

  const notes = typeof payload.notes === "string" ? payload.notes.trim() : "";
  if (notes.length > MAX_NOTES_LENGTH) {
    return { ok: false, message: "Notes must be 2000 characters or fewer" };
  }

  return {
    ok: true,
    value: {
      rsn,
      intendedHours: payload.intendedHours,
      payingForOthers: payload.payingForOthers,
      coveredPlayers,
      donation: payload.donation,
      notes,
    },
  };
};

const isDuplicateEntryError = (error: unknown): boolean =>
  (error as { code?: string })?.code === "ER_DUP_ENTRY";

export const submitBingoSignup = async (req: CabbageRequest, res: Response) => {
  try {
    const cabbageId = getCabbageIdFromRequest(req);

    if (!cabbageId) {
      return sendError(res, 401, "Unauthorized");
    }

    const validation = validateSignupBody(req.body);

    if (!validation.ok) {
      return sendError(res, 400, validation.message);
    }

    const existing = await getBingoSignupByCabbageId(cabbageId);

    if (existing) {
      return sendError(res, 409, "You have already signed up for the bingo");
    }

    const signup = await createBingoSignup({
      cabbageId,
      ...validation.value,
    });

    if (!signup) {
      return sendError(res, 500, "Failed to create bingo signup");
    }

    // Notification is best-effort: the signup is already committed.
    void notifyBingoSignup(signup).catch((error: unknown) => {
      console.error(
        `Failed to send bingo signup Discord notification: ${error}`,
      );
    });

    return res.status(201).json({ signup });
  } catch (error) {
    if (isDuplicateEntryError(error)) {
      return sendError(res, 409, "You have already signed up for the bingo");
    }

    console.error(`Error submitting bingo signup: ${error}`);
    return sendError(res, 500, "Internal server error");
  }
};

export const getMyBingoSignup = async (req: CabbageRequest, res: Response) => {
  try {
    const cabbageId = getCabbageIdFromRequest(req);

    if (!cabbageId) {
      return sendError(res, 401, "Unauthorized");
    }

    const signup = await getBingoSignupByCabbageId(cabbageId);

    return res.status(200).json({ signup: signup ?? null });
  } catch (error) {
    console.error(`Error getting bingo signup for user: ${error}`);
    return sendError(res, 500, "Internal server error");
  }
};

export const getBingoSignups = async (_req: CabbageRequest, res: Response) => {
  try {
    const signups = await getAllBingoSignups();

    return res.status(200).json({ signups });
  } catch (error) {
    console.error(`Error getting bingo signups: ${error}`);
    return sendError(res, 500, "Internal server error");
  }
};

export const setBingoSignupStatus = async (
  req: CabbageRequest,
  res: Response,
) => {
  try {
    const signupId = Number(req.params.id);

    if (!Number.isSafeInteger(signupId) || signupId <= 0) {
      return sendError(res, 400, "Invalid signup id");
    }

    const status = (req.body as { status?: unknown })?.status;

    if (
      typeof status !== "string" ||
      !BINGO_SIGNUP_STATUSES.includes(status as BingoSignupStatus)
    ) {
      return sendError(res, 400, "Status must be one of: unpaid, paid, zeroed");
    }

    const moderatorCabbageId = getCabbageIdFromRequest(req);

    const result = await updateBingoSignupStatus(
      signupId,
      status as BingoSignupStatus,
      moderatorCabbageId,
    );

    if (!result) {
      return sendError(res, 404, "Bingo signup not found");
    }

    return res
      .status(200)
      .json({ signup: result.signup, cascaded: result.cascaded });
  } catch (error) {
    console.error(`Error updating bingo signup status: ${error}`);
    return sendError(res, 500, "Internal server error");
  }
};

type BingoPlayer = {
  rsn: string;
  intendedHours: number;
  source: "signup" | "covered";
  coveredBy: string | null;
};

// Covered players are drafted like anyone else, so they are flattened into the
// participant list with 0 intended hours (they never filled the form themselves).
const flattenParticipants = (signups: BingoSignup[]): BingoPlayer[] => {
  const players = new Map<string, BingoPlayer>();

  for (const signup of signups) {
    players.set(normalizeRsnKey(signup.rsn), {
      rsn: signup.rsn.trim(),
      intendedHours: signup.intendedHours,
      source: "signup",
      coveredBy: signup.coveredBy?.rsn ?? null,
    });
  }

  for (const signup of signups) {
    for (const covered of signup.coveredPlayers) {
      const key = normalizeRsnKey(covered);
      if (!key || players.has(key)) continue;

      players.set(key, {
        rsn: covered.trim(),
        intendedHours: 0,
        source: "covered",
        coveredBy: signup.rsn,
      });
    }
  }

  return Array.from(players.values()).sort((a, b) =>
    a.rsn.localeCompare(b.rsn, undefined, { sensitivity: "base" }),
  );
};

export const getBingoPlayers = async (_req: CabbageRequest, res: Response) => {
  try {
    const signups = await getBingoParticipants();

    return res.status(200).json({ players: flattenParticipants(signups) });
  } catch (error) {
    console.error(`Error getting bingo players: ${error}`);
    return sendError(res, 500, "Internal server error");
  }
};

export const getOsrsHiscores = async (req: CabbageRequest, res: Response) => {
  try {
    const rsn = normalizeRsn(req.query.rsn);

    if (!rsn) {
      return sendError(res, 400, "Invalid RSN");
    }

    const result = await fetchOsrsHiscores(rsn);

    if (result.ok) {
      return res.status(200).json({ player: result.player });
    }

    if (result.reason === "not_found") {
      return sendError(res, 404, "Player not found on the OSRS hiscores");
    }

    console.error(`Error fetching OSRS hiscores: ${result.error}`);
    return res.status(502).json({
      message: "Could not reach the OSRS hiscores",
      error: result.error,
    });
  } catch (error) {
    console.error(`Error fetching OSRS hiscores: ${error}`);
    return res.status(502).json({
      message: "Could not reach the OSRS hiscores",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
