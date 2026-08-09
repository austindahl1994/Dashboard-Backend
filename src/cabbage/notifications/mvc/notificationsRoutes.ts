import cabbageMiddleware from "@/middleware/cabbageMiddleware.ts";
import express from "express";
import * as nc from "./notificationsController.ts";

const router = express.Router();

router.post(
  "/createNotification",
  cabbageMiddleware,
  nc.createNotificationForUser,
);

router.put(
  "/updateNotification/:notificationId",
  cabbageMiddleware,
  nc.updateNotification,
);
router.get("/getNotifications", cabbageMiddleware, nc.getNotifications);

export default router;
