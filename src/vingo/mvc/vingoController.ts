import { EVENT_STARTED } from "../cachedData.js";
import { Request, Response } from "express";
import type { File as MulterFile } from "multer";

import { Client } from "@/types/client.ts";
import { clients } from "../cachedData.ts";
import { displayTime } from "@/Utilities.js";
// Check if file is
// FROM DINK
// Allow players to upload images from web page as well? Rename to dinkUpload if that's the case
export const upload = async (
  req: Request & { file?: MulterFile },
  res: Response
) => {
  const file = req.file;
  let image: Buffer | undefined | null;
  let mimetype: string = "";
  console.log(`✅ Upload successful`);
  displayTime();
  try {
    if (!file) {
      console.log(`No file sent with`);
      throw new Error(`No file sent with.`);
    } else {
      image = file.buffer;
      mimetype = file.mimetype;
    }

    const data = req.body.payload_json;
    const parsedData = JSON.parse(data);

    console.log(`Received data from ${parsedData.playerName}`);
    console.log(JSON.stringify(parsedData));
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
    if (!EVENT_STARTED) {
      throw new Error("Event has not started yet!");
    }
    // Try to get cached board, if there is none, make google call to get board
  } catch (e) {
    return res.status(400).json({ message: `Error getting board: ${e}` });
  }
};

export const team = async (req: Request, res: Response) => {
  const { team, discord_id } = req.body;
  try {
    // Check to make sure player is on team from cached players
    // Get all board completion data for that team
    console.log(`Team: ${team} id: ${discord_id}`);
  } catch (e) {
    return res
      .status(400)
      .json({ message: `Error getting team data from database: ${e}` });
  }
};

export const event = async (req: Request, res: Response) => {
  try {
    const { team, discord_id } = req.body;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const clientId = Date.now();

    const newClient: Client = {
      id: clientId,
      res: res,
      team,
      player: discord_id,
    };

    clients.push(newClient);
    console.log(`Client ${clientId} connected (${clients.length} total)`);
    res.write(`data: ${JSON.stringify({ message: "Connected!" })}\n\n`);

    req.on("close", () => {
      console.log(`Client ${clientId} disconnected`);
      const idx = clients.findIndex((c) => c.id === clientId);
      if (idx !== -1) clients.splice(idx, 1);
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: `Error getting team data from database: ${error}` });
  }
};

export const broadcast = async (req: Request, res: Response) => {
  try {
  } catch (error) {
    return res
      .status(400)
      .json({ message: `Error broadcasting data: ${error}` });
  }
};
