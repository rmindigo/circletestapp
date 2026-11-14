import type { RequestHandler } from "express";

// Lets you make the API fail on purpose so monitoring alerts fire and
// CircleCI release validation can be exercised. Only mounted when
// ENABLE_FAULT_INJECTION=true.
export function createFaultInjector() {
  let errorRate = 0;

  const inject: RequestHandler = (_req, res, next) => {
    if (errorRate > 0 && Math.random() < errorRate) {
      res.status(500).json({ error: "injected fault" });
      return;
    }
    next();
  };

  const control: RequestHandler = (req, res) => {
    const rate = Number(req.body?.errorRate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
      res.status(400).json({ error: "errorRate must be a number between 0 and 1" });
      return;
    }
    errorRate = rate;
    res.json({ errorRate });
  };

  return { inject, control };
}
