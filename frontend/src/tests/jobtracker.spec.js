import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, request }) => {
  await request.delete("http://localhost:3001/api/applications/all");
  await page.goto("http://localhost:5173");
  await page.waitForLoadState("networkidle");
});

async function addApplication(page, company, role, status = null) {
  const before = await page.getByTestId("stat-total").innerText();
  await page.getByTestId("company-input").fill(company);
  await page.getByTestId("role-input").fill(role);
  if (status) await page.getByTestId("status-select").selectOption(status);
  await page.getByTestId("add-btn").click();
  await expect(page.getByTestId("stat-total")).not.toContainText(before, { timeout: 10000 });
}

//ui

test("page loads with correct title", async ({ page }) => {
  await expect(page.locator("h1")).toContainText("Job Tracker");
});

test("shows empty state on load", async ({ page }) => {
  await expect(page.getByTestId("empty-state")).toBeVisible();
});

test("stats start at zero", async ({ page }) => {
  await expect(page.getByTestId("stat-total")).toContainText("0");
  await expect(page.getByTestId("stat-applied")).toContainText("0");
});

//add

test("can add a new application", async ({ page }) => {
  // Capture all console messages from the browser
  page.on("console", msg => console.log("BROWSER:", msg.type(), msg.text()));
  page.on("response", res => {
    if (res.url().includes("3001")) {
      console.log("RESPONSE:", res.status(), res.url());
    }
  });

  await addApplication(page, "Shopify", "Software Developer Intern");
  await expect(page.getByTestId("application-card").first()).toContainText("Shopify", { timeout: 10000 });
});

test("stat counter increments when application added", async ({ page }) => {
  await addApplication(page, "Kinaxis", "DevOps Intern");
  await expect(page.getByTestId("stat-total")).toContainText("1", { timeout: 10000 });
  await expect(page.getByTestId("stat-applied")).toContainText("1");
});

test("clears form after adding application", async ({ page }) => {
  await addApplication(page, "Ciena", "QA Intern");
  await expect(page.getByTestId("company-input")).toHaveValue("", { timeout: 10000 });
  await expect(page.getByTestId("role-input")).toHaveValue("");
});

//validating

test("shows error when company is empty", async ({ page }) => {
  await page.getByTestId("role-input").fill("Developer Intern");
  await page.getByTestId("add-btn").click();
  await expect(page.getByTestId("error-msg")).toContainText("Company and role are required.");
});

test("shows error when role is empty", async ({ page }) => {
  await page.getByTestId("company-input").fill("Shopify");
  await page.getByTestId("add-btn").click();
  await expect(page.getByTestId("error-msg")).toContainText("Company and role are required.");
});

//delete

test("can delete an application", async ({ page }) => {
  await addApplication(page, "Lumentum", "Firmware Intern");
  await expect(page.getByTestId("application-card")).toHaveCount(1, { timeout: 10000 });
  await page.getByTestId("delete-btn").first().click();
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("application-card")).toHaveCount(0, { timeout: 10000 });
  await expect(page.getByTestId("stat-total")).toContainText("0");
});

//status

test("can update application status", async ({ page }) => {
  await addApplication(page, "Ericsson", "Cloud Intern");
  await expect(page.getByTestId("application-card")).toHaveCount(1, { timeout: 10000 });
  await page.getByTestId("status-update").first().selectOption("Interview");
  await page.waitForLoadState("networkidle");
  await expect(page.getByTestId("stat-interview")).toContainText("1", { timeout: 10000 });
});

test("filter by status works", async ({ page }) => {
  await addApplication(page, "Shopify", "Backend Intern");
  await addApplication(page, "Ciena", "QA Intern", "Interview");
  await expect(page.getByTestId("application-card")).toHaveCount(2, { timeout: 10000 });
  await page.getByTestId("filter-interview").click();
  await expect(page.getByTestId("application-card")).toHaveCount(1, { timeout: 10000 });
  await expect(page.getByTestId("application-card").first()).toContainText("Ciena");
});

//switch

test("theme toggle switches between light and dark mode", async ({ page }) => {
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", "dark");
  await page.getByTestId("theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByTestId("theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});