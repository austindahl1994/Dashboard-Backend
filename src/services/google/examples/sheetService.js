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

export const writeToSheet = async (range, values) => {
  try {
    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
  } catch (error) {
    console.log(error);
  }
};

export const readFromSheet = async (range) => {
  try {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range,
    });
    return response.data.values;
  } catch (error) {
    console.log(error);
  }
};

//batch all sheet requests
export const readFromMultipleSheets = async (ranges) => {
  try {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: process.env.SHEET_ID,
      ranges,
    });

    return response.data.valueRanges.map((rangeData) => rangeData.values);
  } catch (error) {
    console.log(error);
  }
};

export const writeBatchToSheet = async (updates) => {
  try {
    const sheets = await getSheetsClient();

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.SHEET_ID,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: updates,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
