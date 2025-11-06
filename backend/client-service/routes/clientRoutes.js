/**
 * @file clientRoutes.js
 * @description Defines client routes for viewing and purchasing tickets.
 */

import express from "express";
import { listEvents, purchaseTicket } from "../controllers/clientController.js";
// Import auth middleware from the user-authentication service so we can protect purchase route
import { requireAuth } from "../../user-authentication/middleware/authMiddleware.js";

const router = express.Router();

router.get("/events", listEvents);

// Protect purchases in non-test mode. In test mode we allow the route for CI/in-memory DB.
const authMiddleware = process.env.NODE_ENV === 'test' ? ((req,res,next)=>next()) : requireAuth;
router.post("/events/:id/purchase", authMiddleware, purchaseTicket);

export default router;