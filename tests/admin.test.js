/**
 * verifies the the admin microservice can
 * create events correctly
 * retrieve events
 * handle invalid inputs
 
import request from "supertest";
import app from "../backend/admin-service/server.js";


describe("Admin Service", () => {
//test 1 - create event
  it("creates a new event", async () => {
    const res = await request(app)
      .post("/api/events")
      .send({ name: "Clemson Game", total_tickets: 100, price: 25 });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Clemson Game");
  });

  //test 2 - retrieve events
  it("retrieves all events", async () => {
    const res = await request(app).get("/api/events");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  //test 3 - input validation
  it("rejects missing fields", async () => {
    const res = await request(app)
      .post("/api/events")
      .send({ total_tickets: 20 });
    expect(res.statusCode).toBe(400);
  });
});

*/


/**
 * @file admin.test.js
 * @description Integration tests for Admin Service endpoints.
 */

import request from "supertest";
import app from "../backend/admin-service/server.js";

describe("Admin Service", () => {
  it("creates a new event successfully", async () => {
    const res = await request(app)
      .post("/api/admin/events")
      .send({
        title: "Clemson Tigers Game",
        description: "Football game at Memorial Stadium",
        start_time: "2025-11-10T17:00:00Z",
        end_time: "2025-11-10T21:00:00Z",
        address: "Clemson, SC",
        num_tickets: 50,
        organizerID: 1,
        ticket_price: 25.0,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("eventID");
    expect(res.body).toHaveProperty("tickets_created", 50);
  });

  it("rejects invalid event input", async () => {
    const res = await request(app)
      .post("/api/admin/events")
      .send({ title: "", num_tickets: -5 });
    expect(res.statusCode).toBe(400);
  });
});



