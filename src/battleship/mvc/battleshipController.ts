// BATTLESHIP CONTROLLER
import type { File as MulterFile } from "multer";
import { Request, Response } from "express";
import { displayTime } from "@/Utilities.js";
import { Dink } from "@/types/dink.ts";
import { getAllBattleShipData, getCachedBoard } from "../cachedBSData.ts";

// NEED API CALLS FOR:
// Get battleship stats from database, hits, misses, urls, rsns, etc
// Posting Dink data:
// 1. Parse data, double check item is on list, check if been obtained
// 2. If obtained, just delete, if not (interchangeable):
//  3a. Check if hit or miss
//  3b. Save the image in S3 bucket to show the drop on frontend
// 4. Store the URL + Player data to database
// 5. Cache the player data locally? Worth it?

// BATTLESHIP DINKDATA
export const battleshipDinkData = async (
  req: Request & { file?: MulterFile },
  res: Response,
) => {
  const file = req.file;
  let image: Buffer | undefined | null;
  let mimetype: string = "";
  console.log(`⚠️ Received API request to /upload ⚠️`);
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
    const parsedData: Dink = JSON.parse(data);

    console.log(`Received data from ${parsedData.playerName}`);
    console.log(JSON.stringify(parsedData));

    if (!image) throw new Error(`No image was passed with dink data.`);

    if (parsedData.type.toLowerCase() === "loot") {
      if (parsedData.extra?.source?.toLowerCase() === "loot chest") {
        throw new Error("PvP Loot chest not allowed");
      }
      // TODO: LOGIC HERE
    } else {
      // IF NOT LOOT TYPE, WE DONT WANT IT, THROW ERROR TO DELETE IT
      console.log(
        `Dink data from player: ${parsedData.playerName} is not loot type`,
      );
      throw new Error(`Invalid Dink type`);
    }
  } catch (e) {
    // DELETE FILE
    console.log(`Deleting file: ${e}`);
    if (req.file) {
      delete req.file;
      image = null;
      mimetype = "";
    }
    res.sendStatus(200); // Send back to dink as to not get more requests?
  }
};

// Get the cached battleship grid pulled from google sheets
export const getBoard = async (req: Request, res: Response) => {
  try {
    // TODO: Logic to get grid data
    const gridData = await getCachedBoard();
    // res.status(200).json(gridData)
  } catch (error) {
    console.log(`Error getting battleship grid: ${error}`);
    return res
      .status(400)
      .json({ message: `Error getting battleship grid: ${error}` });
  }
};

export const getBattleshipPlayerData = async (req: Request, res: Response) => {
  try {
    // TODO: Logic to get battleship data
  } catch (error) {
    console.log(`Error getting player data`);
  }
};

// export const completions = async (req: Request, res: Response) => {
//   try {
//     // console.log(`Completion request`);
//     const { team, role, adminTeam } = req.body;
//     if (role !== "admin" && adminTeam !== undefined) {
//       return res.status(403).json({
//         message: `Only admins can request completions for other teams`,
//       });
//     }
//     const data = await getCompletionsByTeam(team, adminTeam);
//     // console.log(`Got completions for team: ${team}`);
//     // console.log(`Data returned: ${JSON.stringify(data)}`);
//     res.status(200).json(data);
//   } catch (error) {
//     console.log(`Error getting completions: ${error}`);
//     return res
//       .status(400)
//       .json({ message: `Error getting completions: ${error}` });
//   }
// };
