/**
 * @file admin.test.js
 * @description Improved integration tests for Admin Service 
 * Tests verify event creation, input validation, and cross-service visibility
 */

import request from "supertest";
import adminApp from "../backend/admin-service/server.js";
import clientApp from "../backend/client-service/server.js";  // cross-service check

describe("Admin Service — Event Creation", () => {

  it("creates a new event and generates correct number of tickets", async () => {
    const res = await request(adminApp)
      .post("/api/admin/events")
      .send({
        title: "Jazz Night",
        description: "Live jazz at the Amphitheater",
        start_time: "2025-11-15T18:00:00Z",
        end_time: "2025-11-15T21:00:00Z",
        address: "Clemson, SC",
        num_tickets: 5,
        organizerID: 1
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("eventID");
    expect(res.body).toHaveProperty("tickets_created", 5);
  });

  it("rejects invalid event input (missing title or invalid ticket count)", async () => {
    const res = await request(adminApp)
      .post("/api/admin/events")
      .send({ title: "", num_tickets: -10 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it("makes newly created events visible to the client service", async () => {
    // Create event via admin
    const createRes = await request(adminApp)
      .post("/api/admin/events")
      .send({
        title: "Rock Concert",
        description: "Main stage performance",
        start_time: "2025-12-01T19:00:00Z",
        end_time: "2025-12-01T22:00:00Z",
        address: "Clemson, SC",
        num_tickets: 3,
        organizerID: 10
      });

    const eventID = createRes.body.eventID;

    // Then list events via client service
    const listRes = await request(clientApp).get("/api/events");

    // Expect this new event to show up
    const found = listRes.body.find(e => e.eventID === eventID);

    expect(found).toBeDefined();
    expect(found.title).toBe("Rock Concert");
    expect(found.num_tickets).toBeGreaterThan(0);
  });

});