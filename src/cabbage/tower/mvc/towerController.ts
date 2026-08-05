import type { File as MulterFile } from "multer";
import type { Request, Response } from "express";
import type { Dink } from "@/types/index.ts";
import type { CabbageRequest } from "@/middleware/cabbageMiddleware.ts";
import {
  getCachedTowerData,
  getRequesterCabbageId,
} from "../towerGlobalData.ts";
import { getAllCompletions, getCompletionsById } from "./tower.ts";
import {
  checkCompletion,
  processManualTowerSubmission,
} from "../towerProcesses.ts";
import { displayTime } from "@/Utilities.js";

export const towerDinkData = async (req: Request, res: Response) => {
  let image: Buffer | undefined;
  let mimetype = "";
  try {
    displayTime();
    const file = (req as Request & { file?: MulterFile }).file;

    if (!file) {
      console.log(`No file submitted with data.`);
      throw new Error(`No file submitted with data.`);
    }

    image = file.buffer;
    mimetype = file.mimetype;

    const payload = req.body?.payload_json;
    const parsedData: Dink =
      typeof payload === "string" ? JSON.parse(payload) : payload;

    if (!parsedData || typeof parsedData !== "object") {
      throw new Error("Invalid payload_json data.");
    }

    if (!image) {
      throw new Error("No image buffer submitted.");
    }

    console.log(`Received data from ${parsedData.playerName}`);
    const items = new Set(parsedData.extra?.items?.map((i) => i.name) ?? []);

    console.log(items);

    await checkCompletion(image, mimetype, parsedData);
    res.sendStatus(200);
  } catch (error) {
    console.error(`Error processing tower dink data: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    const requestWithFile = req as Request & { file?: MulterFile };

    if (requestWithFile.file?.buffer) {
      requestWithFile.file.buffer.fill(0);
    }

    if (requestWithFile.file) {
      delete requestWithFile.file;
    }

    image = undefined;
    mimetype = "";
  }
};

export const manualSubmission = async (req: Request, res: Response) => {
  let image: Buffer | undefined;
  let mimetype = "";
  try {
    displayTime();
    const file = (req as Request & { file?: MulterFile }).file;

    if (!file) {
      console.log("Manual submission rejected: no file uploaded", req.body);
      return res.status(400).json({ error: "No file submitted." });
    }

    image = file.buffer;
    mimetype = file.mimetype;

    const payload = req.body?.payload_json ?? req.body;
    const parsedData =
      typeof payload === "string" ? JSON.parse(payload) : payload;

    console.log("Manual submission payload received:", parsedData);

    if (!parsedData || typeof parsedData !== "object") {
      throw new Error("Invalid manual submission payload.");
    }

    if (!image) {
      throw new Error("No image buffer submitted.");
    }

    const rsn = typeof parsedData.rsn === "string" ? parsedData.rsn : "";
    const discordId =
      typeof parsedData.discordId === "string"
        ? parsedData.discordId
        : typeof parsedData.discord_id === "string"
          ? parsedData.discord_id
          : undefined;

    if (!rsn) {
      throw new Error("Missing RSN in manual submission payload.");
    }

    await processManualTowerSubmission(image, mimetype, {
      rsn,
      discordId,
      item: parsedData.item,
      floor:
        typeof parsedData.floor === "number"
          ? parsedData.floor
          : parsedData.floor === "number"
            ? Number(parsedData.floor)
            : undefined,
    });

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    const requestWithFile = req as Request & { file?: MulterFile };

    if (requestWithFile.file?.buffer) {
      requestWithFile.file.buffer.fill(0);
    }

    if (requestWithFile.file) {
      delete requestWithFile.file;
    }

    image = undefined;
    mimetype = "";
  }
};

export const getTowerCompletions = async (
  req: CabbageRequest,
  res: Response,
) => {
  try {
    const completions = await getAllCompletions();
    return res.json(completions);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// export const judgeCompletion = async (req: CabbageRequest, res: Response) => {
//   try {
//     const { completionId, judge } = req.body;

//     if (!completionId || typeof judge !== "boolean") {
//       return res.status(400).json({ error: "Invalid request body" });
//     }

//     const result = await judgeTowerCompletion(completionId, judge);
//     return res.json(result);
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

export const getTowerData = async (req: CabbageRequest, res: Response) => {
  try {
    if (!req.cabbage?.discord_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const bodyDiscordId = req.body?.discordId;
    const queryDiscordId = req.query?.discordId;
    const requestedDiscordId =
      typeof bodyDiscordId === "string"
        ? bodyDiscordId
        : typeof queryDiscordId === "string"
          ? queryDiscordId
          : undefined;

    const discordId = requestedDiscordId ?? req.cabbage.discord_id;

    if (requestedDiscordId && req.cabbage.discord_id !== requestedDiscordId) {
      return res.status(403).json({ error: "Forbidden: discordId mismatch" });
    }

    const cached = getCachedTowerData(discordId);
    const cabbageId = getRequesterCabbageId(discordId);
    const towerCompletions = cabbageId
      ? await getCompletionsById(cabbageId)
      : [];

    return res.json({
      ...cached,
      towerCompletions, // dataset #2
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
