/**
 * @file clientController.js
 * @description Business logic for event display and ticket purchase
 */

//import getAllEvents and buyTicket functions from clientModel.js
import { getAllEvents, buyTicket } from "../models/clientModel.js";

/**
 * GET /api/events
 * Returns a list of events.
 */
//this is the function that responds to GET /api/events requests. The function will inject the req and res objects
export function listEvents(req, res) {
  getAllEvents((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    //sends resulting rows array as a JSON
    res.json(rows);
  });
}

/**
 * POST /api/events/:id/purchase
 * Buys a ticket for the specified event
 */

//this is the function that responds to POST /api/events/:id/buy-ticket requests. 
export function purchaseTicket(req, res) {
  const eventID = req.params.id;
  const buyerID = req.body.buyerID || 1;

  buyTicket(eventID, buyerID, (err, result) => {
    if (err) {
      // Always respond with consistent structure for tests
      const status = err.status || 400;
      const message = err.message || "Purchase failed";
      return res.status(status).json({ message });
    }

    // Handle successful purchase or "sold out" fallback
    const message =
      result?.message ||
      (result ? "Purchase successful" : "Sold out");

    return res.status(200).json({
      message,
      ...result,
    });
  });
}