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

// If reading from multiple sheets at once
export const readMultipleSheets = async (ranges) => {
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

// If updating multiple sheets at once
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

// Can read from selected Col ranges, e.g. A2:A50
// Can read from multiple Col ranges with array ["final!B2:B400", "final!F2:F400"]
// 1. Write to a single sheet
// await writeSingleSheet("Sheet1!A1:B2", [
//   ["Name", "Score"],
//   ["Alice", 100],
// ]);
//
// Result in Sheet1:
// | Name  | Score |
// |-------|-------|
// | Alice | 100   |
//
//
// 2. Read from a single sheet
// ---------------------------
// const data = await readSingleSheet("Sheet1!A1:B3");
//
// If the sheet looks like:
// | Name  | Score |
// |-------|-------|
// | Alice | 100   |
// | Bob   | 90    |
//
// Returned data:
// [
//   ["Name", "Score"],
//   ["Alice", "100"],
//   ["Bob", "90"]
// ]
//
//
// 3. Read from multiple sheets
// ----------------------------
// const ranges = ["Sheet1!A1:B2", "Sheet2!A1:C2"];
// const data = await readMultipleSheets(ranges);
//
// If Sheet1 looks like:
// | Name  | Score |
// |-------|-------|
// | Alice | 100   |
//
// And Sheet2 looks like:
// | Item  | Price | Qty |
// |-------|-------|-----|
// | Pen   | 1     | 5   |
//
// Returned data:
// [ all data
//   [ specific sheet
//     ["Name", "Score"], ["Alice", "100"] specific row
//   ],
//   [
//     ["Item", "Price", "Qty"], ["Pen", "1", "5"]
//   ]
//  ]
//
//
// 4. Write batch to multiple sheets
// ---------------------------------
// await writeBatchToSheet([
//   {
//     range: "Sheet1!A1:B2",
//     values: [
//       ["Name", "Score"],
//       ["Charlie", 85],
//     ],
//   },
//   {
//     range: "Sheet2!A1:C2",
//     values: [
//       ["Item", "Price", "Qty"],
//       ["Notebook", 3, 10],
//     ],
//   },
// ]);
//
// Effect:
// - Updates Sheet1 A1:B2 with "Name, Score" and Charlie's row
// - Updates Sheet2 A1:C2 with "Item, Price, Qty" and Notebook row
//
// =============================
