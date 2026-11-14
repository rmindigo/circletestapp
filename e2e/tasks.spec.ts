import { expect, test } from "@playwright/test";

// The API keeps tasks in memory and tests run in parallel, so each test
// uses a unique title instead of assuming an empty list.
function uniqueTitle(label: string) {
  return `${label} ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible();
});

test("adds a task", async ({ page }) => {
  const title = uniqueTitle("Add");
  await page.getByLabel("New task").fill(title);
  await page.getByRole("button", { name: "Add", exact: true }).click();

  await expect(page.getByText(title)).toBeVisible();
  await expect(page.getByLabel("New task")).toHaveValue("");
});

test("added tasks persist across reloads", async ({ page }) => {
  const title = uniqueTitle("Persist");
  await page.getByLabel("New task").fill(title);
  await page.keyboard.press("Enter");
  await expect(page.getByText(title)).toBeVisible();

  await page.reload();
  await expect(page.getByText(title)).toBeVisible();
});

test("ignores blank tasks", async ({ page }) => {
  const before = await page.getByRole("listitem").count();
  await page.getByLabel("New task").fill("   ");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("listitem")).toHaveCount(before);
});
