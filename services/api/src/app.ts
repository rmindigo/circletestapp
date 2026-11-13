import express from "express";
import { TaskStore } from "./tasks.js";

export function createApp(store = new TaskStore()) {
  const app = express();
  app.use(express.json());

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

  return app;
}
