import {
  EVENT_STARTED,
  teamPoints,
  teamShameMap,
  completionsMap,
  boardMap,
} from "../cachedData.js";
import { Request, Response } from "express";
import type { File as MulterFile } from "multer";
import { displayTime } from "@/Utilities.js";
import { getBoard } from "../board.ts";
import { checkShame } from "../shame.ts";
import { checkDinkLoot } from "../checkDinkLoot.ts";
import { Completion, Dink } from "@/types/index.ts";
import { completeTile } from "../completeTile.ts";
import { lootEmbed, manualEmbed } from "../../bot/embeds/vingo/logs.js";
import { sendLog } from "../../bot/broadcasts/sendLog.js";
import {
  addCompletion,
  getCompletionsByTeam,
  getShameByTeam,
} from "./vingo.ts";
import { streamUpload } from "@/services/aws/s3.js";
import { updateCompletions } from "../completions.ts";
// CNTL + ALT + I Copilot

// Allow players to upload images from web page as well? Rename to dinkUpload if that's the case
export const dinkUpload = async (
  req: Request & { file?: MulterFile },
  res: Response,
) => {
  const file = req.file;
  let image: Buffer | undefined | null;
  let mimetype: string = "";
  console.log(`✅ Received API request to /upload`);
  displayTime();
  // AWAIT discord post from bot, showing what data was sent from server before anything else
  try {
    // if (!EVENT_STARTED) {
    //   throw new Error("Event has not started yet");
    // }
    if (!file) {
      console.log(`No file sent with`);
      throw new Error(`No file sent with.`);
    } else {
      image = file.buffer;
      mimetype = file.mimetype;
    }

    const data = req.body.payload_json;
    const parsedData: Dink = JSON.parse(data);

    console.log(`Received data from ${parsedData.playerName}`);
    console.log(JSON.stringify(parsedData));

    if (!image) throw new Error(`No image was passed with dink data.`);

    if (parsedData.type.toLowerCase() === "death") {
      console.log(`Type was death, skipping rest`);
      await checkShame(parsedData, image, mimetype);
      delete req.file;
      image = null;
      mimetype = "";
    } else if (parsedData.type.toLowerCase() === "loot") {
      if (parsedData.extra?.source?.toLowerCase() === "loot chest") {
        throw new Error("PvP Loot chest not allowed");
      }
      const embed = lootEmbed(parsedData);
      await sendLog(embed);
      // console.log(`Type was loot`);
      const verifiedCompletions: Completion[] | false =
        checkDinkLoot(parsedData);

      if (verifiedCompletions) {
        for await (const completion of verifiedCompletions) {
          await completeTile(completion, image, mimetype);
        }
      } else {
        throw new Error(`Data was loot type but not needed`);
      }
    } else {
      console.log(
        `Dink Type: ${parsedData.type} from player: ${parsedData.playerName} is not loot/death type`,
      );
      throw new Error(`Invalid Dink type`);
    }
  } catch (e) {
    console.log(`Deleting file: ${e}`);
    if (req.file) {
      delete req.file;
      image = null;
      mimetype = "";
    }
    res.sendStatus(200); // Send back to dink as to not get more requests?
  }
};

export const board = async (req: Request, res: Response) => {
  try {
    //console.log(`Called get board`);
    const board = await getBoard();
    console.log(`Board gotten`);
    res.json(board);
  } catch (e) {
    return res.status(400).json({ message: `Error getting board: ${e}` });
  }
};

export const team = async (req: Request, res: Response) => {
  const { rsn, team, discord_id, role } = req.body;
  try {
    console.log(
      `Called team with data: RSN: ${rsn}, Team: ${team} id: ${discord_id}, role: ${role}`,
    );
    return res.status(200).json({ team: team, rsn: rsn, role: role });
  } catch (e) {
    return res
      .status(400)
      .json({ message: `Error getting team data from database: ${e}` });
  }
};

// Leaving off on splitting up the getting board and completion data, need to figure out caching board, split it into chunks?

export const completions = async (req: Request, res: Response) => {
  try {
    const { team } = req.body;
    const data = await getCompletionsByTeam(team);
    // console.log(`Got completions for team: ${team}`);
    // console.log(`Data returned: ${JSON.stringify(data)}`);
    res.status(200).json(data);
  } catch (error) {
    console.log(`Error getting completions: ${error}`);
    return res
      .status(400)
      .json({ message: `Error getting completions: ${error}` });
  }
};

export const shame = async (req: Request, res: Response) => {
  try {
    const { team } = req.body;
    const data = await getShameByTeam(team);
    // console.log(`Data returned:`);
    // console.log(JSON.stringify(data));
    res.status(200).json(data);
  } catch (error) {
    console.log(`Error getting shame: ${error}`);
    return res.status(400).json({ message: `Error getting shame: ${error}` });
  }
};

export const highscores = async (req: Request, res: Response) => {
  try {
    const highscores = Object.fromEntries(teamPoints);
    const deathCounts = Object.fromEntries(teamShameMap);

    // Build completions object as flat mapping team -> completion count for teams 1..3
    const completions: Record<string, number> = {};
    for (let t = 1; t <= 3; t++) {
      const teamMap = completionsMap.get(t);
      let count = 0;
      if (teamMap) {
        for (const [, arr] of teamMap) {
          count += Array.isArray(arr) ? arr.length : 0;
        }
      }
      completions[String(t)] = count;
    }
    // console.log(`Highscores called, returning data: `);
    // console.log({ highscores, deathCounts, completions });
    return res.status(200).json({ highscores, deathCounts, completions });
  } catch (e) {
    return res
      .status(400)
      .json({ message: `Error getting highscores data: ${e}` });
  }
};

export const webImage = async (
  req: Request & { file?: MulterFile },
  res: Response,
) => {
  // This is similar to dinkUpload but only for web uploads
  try {
    const { team, rsn, id, selectedItem } = req.body;
    console.log(`✅ Received Web Upload request`);
    displayTime();
    const file = req.file;
    let image: Buffer | undefined | null;
    let mimetype: string = "";
    if (!file) {
      console.log(`No file sent with`);
      throw new Error(`No file sent with.`);
    } else {
      image = file.buffer;
      mimetype = file.mimetype;
    }
    // Check if tile still needs completions before uploading
    const tileIdNum = Number(id);
    const teamNum = Number(team);
    const tile = boardMap.get(tileIdNum);
    if (!tile) throw new Error(`Invalid tile id: ${id}`);
    if (!image) throw new Error(`No image was passed with web data.`);
    const teamMap = completionsMap.get(teamNum);
    const completionsForTile = teamMap?.get(tileIdNum) ?? [];
    if (completionsForTile.length >= tile.quantity) {
      throw new Error(
        `Tile ${tileIdNum} for team ${team} already has required completions`,
      );
    }

    const safeName = rsn.replace(/ /g, "_");
    const imageKey = `completions/${team}/${id}/${safeName}-${Date.now()}.png`;
    const item = selectedItem || "None";
    const timeObtained = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short",
    })
      .format(new Date())
      .replace(",", "");

    // upload completion image and wait for final S3 URL
    const awsUrl = await completeTile(
      {
        team: teamNum,
        tile_id: tileIdNum,
        rsn,
        url: imageKey,
        item,
        obtained_at: timeObtained,
      },
      image,
      mimetype,
    );
    const embed = manualEmbed({
      rsn,
      team: teamNum,
      tile_id: tileIdNum,
      item,
      url: awsUrl,
      obtained_at: timeObtained,
    });
    await sendLog(embed);
    res.status(200).json({ message: `Image uploaded successfully` });
  } catch (error) {
    return res
      .status(400)
      .json({ message: `Error uploading image from web: ${error}` });
  }
};

// import { Client } from "@/types/client.ts";
// import { clients } from "../cachedData.ts";
// import { parse } from "node:path";
// export const event = async (req: Request, res: Response) => {
//   try {
//     const teamParam = req.query.team;
//     if (!teamParam) return res.status(400).end();
//     const team = teamParam.toString();

//     console.log(`Creating new SSE client with TEAM: ${team}`);

//     res.setHeader("Content-Type", "text/event-stream");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Connection", "keep-alive");
//     res.flushHeaders();

//     const clientId = Date.now();

//     const newClient: Client = {
//       id: clientId,
//       res,
//       team,
//     };

//     clients.push(newClient);
//     console.log(`Client ${clientId} connected (${clients.length} total)`);

//     // Initial message
//     res.write(`data: ${JSON.stringify({ message: "Connected!" })}\n\n`);

//     // Keep connection alive
//     const keepAlive = setInterval(() => res.write(": keep-alive\n\n"), 15000);

//     req.on("close", () => {
//       clearInterval(keepAlive);
//       const idx = clients.findIndex((c) => c.id === clientId);
//       if (idx !== -1) clients.splice(idx, 1);
//       console.log(`Client ${clientId} disconnected`);
//     });
//   } catch (error) {
//     return res.status(500).json({ message: `Error setting up SSE: ${error}` });
//   }
// };

// export const broadcast = async (req: Request, res: Response) => {
//   try {
//   } catch (error) {
//     return res
//       .status(400)
//       .json({ message: `Error broadcasting data: ${error}` });
//   }
// };
