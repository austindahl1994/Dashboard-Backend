import { google } from "googleapis";
import { readFile } from "fs/promises";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const KEY_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

let sheetsClient;

const getSheetsClient = async () => {
  if (sheetsClient) return sheetsClient;

  if (!KEY_PATH) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_KEY in .env");
  }

  const resolvedPath = path.resolve(KEY_PATH);
  const keys = JSON.parse(await readFile(resolvedPath, "utf8"));

  const auth = new google.auth.GoogleAuth({
    credentials: keys,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const client = await auth.getClient();
  sheetsClient = google.sheets({ version: "v4", auth: client });

  return sheetsClient;
};

// Write to a single sheet
export const writeSingleSheet = async (range, values) => {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.SHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
};

// Get information from a single sheet
export const readSingleSheet = async (range) => {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range,
  });
  return response.data.values;
};

// If reading from multiple sheets at once
export const readMultipleSheets = async (ranges) => {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: process.env.SHEET_ID,
    ranges,
  });

  return response.data.valueRanges.map((rangeData) => rangeData.values);
};

// If updating multiple sheets at once
export const writeBatchToSheet = async (updates) => {
  const sheets = await getSheetsClient();

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: process.env.SHEET_ID,
    requestBody: {
      valueInputOption: "USER_ENTERED",
      data: updates,
    },
  });
};
