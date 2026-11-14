import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { TaskStore } from "../src/tasks.js";

describe("metrics", () => {
  it("counts requests by route pattern and status", async () => {
    const app = createApp();
    await request(app).get("/api/tasks").expect(200);
    await request(app).patch("/api/tasks/99/toggle").expect(404);

    const res = await request(app).get("/metrics").expect(200);
    expect(res.text).toMatch(/http_requests_total\{[^}]*route="\/api\/tasks"[^}]*status="200"[^}]*\} 1/);
    expect(res.text).toMatch(/http_requests_total\{[^}]*route="\/api\/tasks\/:id\/toggle"[^}]*status="404"[^}]*\} 1/);
  });
});

describe("fault injection", () => {
  it("is not exposed unless enabled", async () => {
    const app = createApp(new TaskStore(), { enableFaultInjection: false });
    await request(app).post("/admin/fault").send({ errorRate: 1 }).expect(404);
  });

  it("fails API requests at the configured rate", async () => {
    const app = createApp(new TaskStore(), { enableFaultInjection: true });
    await request(app).post("/admin/fault").send({ errorRate: 1 }).expect(200);
    await request(app).get("/api/tasks").expect(500);
    await request(app).get("/health").expect(200);

    await request(app).post("/admin/fault").send({ errorRate: 0 }).expect(200);
    await request(app).get("/api/tasks").expect(200);
  });

  it("rejects invalid rates", async () => {
    const app = createApp(new TaskStore(), { enableFaultInjection: true });
    await request(app).post("/admin/fault").send({ errorRate: 2 }).expect(400);
  });
});
