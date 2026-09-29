import { test, expect } from "@playwright/test";

const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;

test.describe("Authentication", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login$/);

    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
  });

  test("logs in successfully", async ({ page }) => {
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

    await expect(page).toHaveURL(/\/$/);

    await expect(
      page.getByRole("heading", { name: "Job Queue" }),
    ).toBeVisible();
  });

  test("shows an error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();

    await page.getByLabel("Email").fill("invalid@example.com");
    await page.getByLabel("Password").fill("wrong-password");

    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(
      page.getByText(/invalid|credentials/i),
    ).toBeVisible();
  });
});