import { EVENT_STARTED, teamPoints } from "../cachedData.js";
import { Request, Response } from "express";
import type { File as MulterFile } from "multer";
import { displayTime } from "@/Utilities.js";
import { getBoard } from "../board.ts";
import { checkShame } from "../shame.ts";
import { checkDinkLoot } from "../checkDinkLoot.ts";
import { Completion, Dink } from "@/types/index.ts";
import { completeTile } from "../completeTile.ts";
import { lootEmbed } from "../../bot/embeds/vingo/logs.js";
import { sendLog } from "../../bot/broadcasts/sendLog.js";
import { getCompletionsByTeam, getShameByTeam } from "./vingo.ts";
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
      console.log(`Type was loot`);
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
    // Compare against board tile data, see if it is on the item list
    // If on list, need to upload (USE STREAM METHOD INSTEAD OF JUST UPLOAD FOR AWS)
    // After image is uploaded, save data to RDS with image URL
    // Save completion data to completion map for that team
    // Send completion data to discord tile completions for that team
    // Send completion data to client side via SSE event

    // Add a check, if tile is completed but RSN does not match in playermap, check if discord_id is sent with dink data, if not then just return null, if it does do everything but send an error message in a discord channel
    // await sendMismatch(rsn, expectedRSN, username, nickname)
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
    console.log(`Called get board`);
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
    // Check to make sure player is on team from cached players
    // Send RSN, and role back as well
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
    return res.status(200).json(Object.fromEntries(teamPoints));
  } catch (e) {
    return res
      .status(400)
      .json({ message: `Error getting highscores data: ${e}` });
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
