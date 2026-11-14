import express from "express";
import { createFaultInjector } from "./fault.js";
import { createMetrics } from "./metrics.js";
import { TaskStore } from "./tasks.js";

interface AppOptions {
  enableFaultInjection?: boolean;
}

export function createApp(
  store = new TaskStore(),
  { enableFaultInjection = process.env.ENABLE_FAULT_INJECTION === "true" }: AppOptions = {},
) {
  const app = express();
  const metrics = createMetrics();
  app.use(express.json());
  app.use(metrics.middleware);

  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", metrics.registry.contentType);
    res.send(await metrics.registry.metrics());
  });

  if (enableFaultInjection) {
    const fault = createFaultInjector();
    app.post("/admin/fault", fault.control);
    app.use("/api", fault.inject);
  }

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", version: process.env.APP_VERSION ?? "dev" });
  });

  app.get("/api/tasks", (_req, res) => {
    res.json(store.list());
  });

  app.post("/api/tasks", (req, res) => {
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }
    res.status(201).json(store.create(title));
  });

  app.patch("/api/tasks/:id/toggle", (req, res) => {
    const task = store.toggle(Number(req.params.id));
    if (!task) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.json(task);
  });

  app.delete("/api/tasks/:id", (req, res) => {
    if (!store.remove(Number(req.params.id))) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.status(204).end();
  });

  return app;
}
