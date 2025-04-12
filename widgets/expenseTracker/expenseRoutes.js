import express from "express"
import * as ec from './expenseController.js

const router = express.Router()

router.get("/get", ec.getExpenses)
router.put("/update/:year/:month", ec.updateExpenses)
router.delete("/delete/:year/:month", ec.deleteExpenses)

export default router
