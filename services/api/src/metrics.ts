import type { RequestHandler } from "express";
import { Counter, Histogram, Registry, collectDefaultMetrics } from "prom-client";

// One registry per app instance so tests can create apps without
// clashing on prom-client's global default registry.
export function createMetrics() {
  const registry = new Registry();
  registry.setDefaultLabels({ version: process.env.APP_VERSION ?? "dev" });
  collectDefaultMetrics({ register: registry });

  const requests = new Counter({
    name: "http_requests_total",
    help: "HTTP requests by method, route and status code",
    labelNames: ["method", "route", "status"],
    registers: [registry],
  });

  const duration = new Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request latency",
    labelNames: ["method", "route"],
    buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
    registers: [registry],
  });

  const middleware: RequestHandler = (req, res, next) => {
    const end = duration.startTimer();
    res.on("finish", () => {
      // Use the matched route pattern, not the raw path, to keep label cardinality low
      const route = req.route ? `${req.baseUrl}${req.route.path}` : "unmatched";
      requests.inc({ method: req.method, route, status: String(res.statusCode) });
      end({ method: req.method, route });
    });
    next();
  };

  return { registry, middleware };
}
