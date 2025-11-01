/**
 * @file adminRoutes.js
 * @description Defines routes for admin endpoints so they can be mounted in server.js
 */

import express from "express";
import { addEvent } from "../controllers/adminController.js";

const router = express.Router();

// Route to create events
router.post("/events", addEvent);

export default router;