import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("API", () => {
  it("reports health", async () => {
    const res = await request(createApp()).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("creates and lists tasks", async () => {
    const app = createApp();
    await request(app).post("/api/tasks").send({ title: "Ship it" }).expect(201);
    const res = await request(app).get("/api/tasks");
    expect(res.body).toEqual([{ id: 1, title: "Ship it", done: false }]);
  });

  it("rejects empty titles", async () => {
    await request(createApp()).post("/api/tasks").send({ title: " " }).expect(400);
  });

  it("returns 404 when toggling a missing task", async () => {
    await request(createApp()).patch("/api/tasks/42/toggle").expect(404);
  });
});
