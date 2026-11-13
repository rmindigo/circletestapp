import { describe, expect, it } from "vitest";
import { TaskStore } from "../src/tasks.js";

describe("TaskStore", () => {
  it("creates tasks with incrementing ids", () => {
    const store = new TaskStore();
    expect(store.create("a").id).toBe(1);
    expect(store.create("b").id).toBe(2);
    expect(store.list()).toHaveLength(2);
  });

  it("toggles done state", () => {
    const store = new TaskStore();
    const { id } = store.create("a");
    expect(store.toggle(id)?.done).toBe(true);
    expect(store.toggle(id)?.done).toBe(false);
    expect(store.toggle(999)).toBeUndefined();
  });
});
