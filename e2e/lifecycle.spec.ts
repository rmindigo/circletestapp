import { expect, test } from "@playwright/test";

function uniqueTitle(label: string) {
  return `${label} ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

test("marks a task done and back", async ({ page }) => {
  const title = uniqueTitle("Toggle");
  await page.goto("/");
  await page.getByLabel("New task").fill(title);
  await page.getByRole("button", { name: "Add", exact: true }).click();

  const item = page.getByRole("listitem").filter({ hasText: title });
  const checkbox = item.getByRole("checkbox");

  // The checkbox only flips once the API responds (no optimistic update),
  // so click and wait for the state rather than using check()/uncheck().
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await expect(item).toHaveClass(/done/);

  await page.reload();
  await expect(checkbox).toBeChecked();

  await checkbox.click();
  await expect(checkbox).not.toBeChecked();
  await expect(item).not.toHaveClass(/done/);
});

test("deletes a task end to end", async ({ page }) => {
  const title = uniqueTitle("Delete");
  await page.goto("/");
  await page.getByLabel("New task").fill(title);
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByText(title)).toBeVisible();

  await page.getByRole("button", { name: `Delete ${title}` }).click();
  await expect(page.getByText(title)).toHaveCount(0);

  // Confirms the API actually deleted it, not just the UI
  await page.reload();
  await expect(page.getByText(title)).toHaveCount(0);
});
