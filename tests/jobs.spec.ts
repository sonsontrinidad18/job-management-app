import { test, expect } from "@playwright/test";

const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;

test.describe("Job management", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !email || !password,
      "TEST_USER_EMAIL and TEST_USER_PASSWORD are required",
    );

    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();

    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);

    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(
      page.getByRole("heading", { name: "Job Queue" }),
    ).toBeVisible();
  });

  test("creates, edits, and deletes a job", async ({ page }) => {
    const originalTitle = `Playwright Test Job ${Date.now()}`;
    const updatedTitle = `${originalTitle} - Updated`;

    // CREATE
    await page.getByRole("button", { name: "+ Add New Job" }).click();

    const dialog = page.getByRole("dialog");

    await expect(dialog).toBeVisible();

    await dialog.getByLabel("Job title").fill(originalTitle);

    await dialog.getByRole("combobox").nth(0).click();

    await page.getByRole("option", { name: "John Doe" }).click();

    await dialog.getByLabel("Due date").fill("2026-12-31");

    await dialog.getByRole("button", { name: "Save job" }).click();

    // VERIFY CREATE
    const createdJob = page.getByRole("button", {
      name: originalTitle,
    });

    await expect(createdJob).toBeVisible();

    // Find the row containing the job we just created.
    const jobRow = createdJob
      .locator("xpath=..")
      .locator("xpath=..");

    // EDIT
    await jobRow.getByRole("button", { name: "Edit" }).click();

    const editDialog = page.getByRole("dialog");

    await expect(editDialog).toBeVisible();

    const titleInput = editDialog.getByLabel("Job title");

    await expect(titleInput).toHaveValue(originalTitle);

    await titleInput.fill(updatedTitle);

    await editDialog
      .getByRole("button", { name: "Save job" })
      .click();

    // Wait for the dialog to close after the database update.
    await expect(editDialog).not.toBeVisible();

    // Verify the updated job.
    await expect(
      page.getByRole("button", { name: updatedTitle }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: originalTitle }),
    ).not.toBeVisible();

    // DELETE
    const updatedJob = page.getByRole("button", {
      name: updatedTitle,
    });

    const updatedJobRow = updatedJob
      .locator("xpath=..")
      .locator("xpath=..");

    await updatedJobRow
      .getByRole("button", { name: "Delete" })
      .click();

    const alertDialog = page.getByRole("alertdialog");

    await expect(alertDialog).toBeVisible();

    await alertDialog
      .getByRole("button", { name: "Delete job" })
      .click();

    await expect(alertDialog).not.toBeVisible();

    // VERIFY DELETE
    await expect(
      page.getByRole("button", { name: updatedTitle }),
    ).not.toBeVisible();
  });
});