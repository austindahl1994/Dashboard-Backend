import express from "express";
import * as ec from "./expenseController.js";

const router = express.Router();

router.put("/update/:year/:month", ec.updateExpenses);
router.delete("/delete/:year/:month", ec.deleteExpenses);
router.get("/", ec.getExpenses);

export default router;
