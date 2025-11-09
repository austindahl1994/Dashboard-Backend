import { EVENT_STARTED } from "../cachedData.js";

// Check if file is
// FROM DINK
// Allow players to upload images from web page as well? Rename to dinkUpload if that's the case
export const upload = async (req, res) => {
  const file = req.file;
  let image;
  let mimetype;
  try {
    if (!file) {
      console.log(`No file sent with`);
      throw new Error(`No file sent with.`);
    } else {
      image = file.buffer;
      mimetype = file.mimetype;
    }
    // Compare against board tile data, see if it is on the item list
    // If on list, need to upload (USE STREAM METHOD INSTEAD OF JUST UPLOAD FOR AWS)
    // After image is uploaded, save data to RDS with image URL
    // Send completion data to discord tile completions for that team
    // Send completion data to client side via SSE event
  } catch (e) {
    console.log(`Deleting file: ${e}`);
    if (req.file) {
      delete req.file;
      image = null;
    }
    res.sendStatus(200); // Send back to dink as to not get more requests?
  }
};

export const board = async (req, res) => {
  try {
    if (!EVENT_STARTED) {
      throw new Error("Event has not started yet!");
    }
    // Try to get cached board, if there is none, make google call to get board
  } catch (e) {
    return res.status(400).json({ message: `Error getting board: ${e}` });
  }
};

export const team = async (req, res) => {
  const { team, discord_id } = req.body;
  try {
    // Check to make sure player is on team from cached players
    // Get all board completion data for that team
  } catch (e) {
    return res
      .status(400)
      .json({ message: `Error getting team data from database: ${e}` });
  }
};
