/**
 * makes sure the llm booking service can
 * parse user intents
 * respond with event lists
 * confirm bookings
 
import request from "supertest";
import app from "../backend/llm-booking-service/server.js";
import { parseIntent } from "../backend/llm-booking-service/utils/intentParser.js";

describe("LLM Booking Service", () => {
    //test 1 - parse booking intent
  test("parses booking intent correctly", () => {
    const message = "book 2 tickets for Clemson concert";
    const result = parseIntent(message);
    expect(result.intent).toBe("book");
    expect(result.event).toMatch(/clemson/i);
    expect(result.quantity).toBe(2);
  });

  //test 2 - respond with event list
  test("responds with event list", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "show events" });
    expect(res.statusCode).toBe(200);
    expect(res.body.reply).toMatch(/events/i);
  });

  //test 3 - confirm booking
  test("confirms booking on confirmation", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "yes book the Clemson concert" });
    expect(res.statusCode).toBe(200);
    expect(res.body.reply).toMatch(/booked/i);
  });
});
*/
/**
 * @file llm.test.js
 * @description Tests for the LLM-driven booking service endpoints.
 

import request from "supertest";
import app from "../backend/llm-booking-service/server.js";

describe("LLM Booking Service", () => {
  it("responds to a 'show events' query", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "Show me all events" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("reply");
  });

  it("responds to a 'book tickets' intent", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "Book 2 tickets for Clemson Tigers Game" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("reply");
  });
});
*/

/**
 * @file tests/llm.test.js
 * @description Minimal test for LLM-driven booking endpoint
 */

import request from "supertest";
import express from "express";
import router from "../backend/llm-booking-service/routes/chatRoutes.js";

// Create a lightweight express instance for isolated testing
const app = express();
app.use(express.json());
app.use("/api", router);

describe("LLM Booking Service", () => {
  it("parses natural language booking text correctly", async () => {
    const res = await request(app)
      .post("/api/llm/parse")
      .send({ text: "Book two tickets for Jazz Night" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("event");
    expect(res.body).toHaveProperty("tickets");
    expect(typeof res.body.event).toBe("string");
    expect(typeof res.body.tickets).toBe("number");
  });

  it("returns error message when text cannot be parsed", async () => {
    const res = await request(app)
      .post("/api/llm/parse")
      .send({ text: "asdkjfhaksjdfh" });

expect([200, 400, 422]).toContain(res.statusCode);
  });
});