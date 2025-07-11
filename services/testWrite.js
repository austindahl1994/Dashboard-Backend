import dotenv from "dotenv";
dotenv.config();

import { writeToSheet } from "./sheetService.js";

const testWrite = async () => {
  try {
    const range = "A2"; // Target cell A2
    const values = [["This is a test write"]]; // 2D array required by Sheets API

    await writeToSheet(range, values);

    console.log("Successfully wrote to A2!");
  } catch (error) {
    console.error("Failed to write to sheet:", error);
  }
};

testWrite();
