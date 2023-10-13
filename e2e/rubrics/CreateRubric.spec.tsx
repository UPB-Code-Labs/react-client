import { expect, test } from "@playwright/test";

test.describe.serial("Rubrics creation workflow", () => {
  const teacherEmail = "ermentrudis.klara.2020@upb.edu.co";
  const teacherPassword = "upbbga2020*/";
  const rubricName = "Data structures rubric";

  test("Register test teacher", async ({ page }) => {
    // Login as an admin
    await page.goto("/login");
    await page.getByLabel("Email").fill("development.admin@gmail.com");
    await page.getByLabel("Password").fill("changeme123*/");
    await page.getByRole("button", { name: "Submit" }).click();

    // Register a teacher
    await page.getByRole("link", { name: "R. Teachers", exact: true }).click();
    await page.getByLabel("Full name").fill("Ermentrudis Klara");
    await page.getByLabel("Email").fill(teacherEmail);
    await page.getByLabel("Password").fill(teacherPassword);
    await page.getByRole("button", { name: "Submit" }).click();
  });

  test("Fields to create a rubric are validated", async ({ page }) => {
    // Login as the teacher
    await page.goto("/login");
    await page.getByLabel("Email").fill(teacherEmail);
    await page.getByLabel("Password").fill(teacherPassword);
    await page.getByRole("button", { name: "Submit" }).click();

    // Go to the rubrics page
    await page.getByRole("link", { name: "Rubrics", exact: true }).click();
    await page.waitForURL(/\/rubrics$/);

    // Open the create rubric dialog
    await page.getByRole("button", { name: "Create rubric" }).click();

    // Assert the modal is open
    await expect(page.getByRole("dialog")).toBeVisible();

    // Assert the fields are validated
    await page.getByRole("button", { name: "Create" }).click();
    await expect(
      page.getByText("Name must be at least 4 characters long")
    ).toBeVisible();
  });

  test("Teachers can create rubrics", async ({ page }) => {
    // Login as the teacher
    await page.goto("/login");
    await page.getByLabel("Email").fill(teacherEmail);
    await page.getByLabel("Password").fill(teacherPassword);
    await page.getByRole("button", { name: "Submit" }).click();

    // Go to the rubrics page
    await page.getByRole("link", { name: "Rubrics", exact: true }).click();
    await page.waitForURL(/\/rubrics$/);

    // Open the create rubric dialog
    await page
      .getByRole("button", { name: "Create rubric", exact: true })
      .click();

    // Fill the form
    await page.getByLabel("Name").fill(rubricName);
    await page.getByRole("button", { name: "Create", exact: true }).click();

    // Assert the modal is closed
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Assert the alert is shown
    await expect(page.getByText("The rubric has been created!")).toBeVisible();

    // Assert the rubric is shown in the table
    const rubricRow = page.getByRole("row", {
      name: new RegExp(rubricName)
    });
    await expect(rubricRow).toBeVisible();
    await expect(
      rubricRow.getByRole("cell", { name: rubricName, exact: true })
    ).toBeVisible();
    await expect(
      rubricRow.getByRole("button", { name: `Edit ${rubricName}`, exact: true })
    ).toBeVisible();
  });
});