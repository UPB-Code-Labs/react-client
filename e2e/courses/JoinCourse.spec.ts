import { expect, test } from "@playwright/test";

test.describe.serial("Join courses workflow", () => {
  const teacherEmail = "alexandra.garret.2020@upb.edu.co";
  const teacherPassword = "upbbga2020*/";
  const courseName = "Data Structures NRC 12345";
  let invitationCode: string;

  const studentFullName = "Blythe Macario";
  const studentInstitutionalID = "000984517";
  const studentEmail = "blythe.macario.2020@upb.edu.co";
  const studentPassword = "upbbga2020*/";

  test("Register test teacher", async ({ page }) => {
    // Login as an admin
    await page.goto("/login");
    await page.getByLabel("Email").fill("development.admin@gmail.com");
    await page.getByLabel("Password").fill("changeme123*/");
    await page.getByRole("button", { name: "Submit" }).click();

    // Register a teacher
    await page.getByRole("link", { name: "R. Teachers", exact: true }).click();
    await page.getByLabel("Full name").fill("Alexandra Garret");
    await page.getByLabel("Email").fill(teacherEmail);
    await page.getByLabel("Password").fill(teacherPassword);
    await page.getByRole("button", { name: "Submit" }).click();
  });

  test("Field to create new course is validated", async ({ page }) => {
    // Login as a teacher
    await page.goto("/login");
    await page.getByLabel("Email").fill(teacherEmail);
    await page.getByLabel("Password").fill(teacherPassword);
    await page.getByRole("button", { name: "Submit" }).click();

    // Open the modal
    const createCourseButton = page.getByRole("button", {
      name: "Create a new course"
    });
    await expect(createCourseButton).toBeVisible();
    await createCourseButton.click();

    // Assert the modal is open
    await expect(page.getByRole("dialog")).toBeVisible();

    // Submit the form without filling the name
    await page.getByRole("button", { name: "Create" }).click();

    // Validate the error message
    const errorMessage = page.getByText(
      "Name must be at least 4 characters long"
    );
    await expect(errorMessage).toBeVisible();
  });

  test("Teachers can create a course", async ({ page }) => {
    // Login as a teacher
    await page.goto("/login");
    await page.getByLabel("Email").fill(teacherEmail);
    await page.getByLabel("Password").fill(teacherPassword);
    await page.getByRole("button", { name: "Submit" }).click();

    // Create a course
    const createCourseButton = page.getByRole("button", {
      name: "Create a new course"
    });
    await createCourseButton.click();

    // Fill the form
    await page.getByLabel("Name").fill(courseName);
    await page.getByRole("button", { name: "Create" }).click();

    // Assert an alert is shown
    await expect(
      page.getByText("Course was created successfully")
    ).toBeVisible();

    // Assert the modal is closed
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Assert the course is listed
    await expect(page.getByText(courseName)).toBeVisible();
  });

  test("Teachers can copy the invitation code", async ({ page }) => {
    // Login as a teacher
    await page.goto("/login");
    await page.getByLabel("Email").fill(teacherEmail);
    await page.getByLabel("Password").fill(teacherPassword);
    await page.getByRole("button", { name: "Submit" }).click();

    // Open the dropdown menu
    const courseCard = page.getByRole("link", { name: courseName });
    const dropdownButton = courseCard.getByLabel("Toggle course options menu");
    await expect(dropdownButton).toBeVisible();
    await dropdownButton.click();

    // Assert the dropdown menu is open
    const dropdownMenu = page.getByRole("menu");
    await expect(dropdownMenu).toBeVisible();

    // Click the option to copy the invitation code
    const copyCodeButton = dropdownMenu.getByRole("menuitem", {
      name: "Copy invitation code"
    });
    await expect(copyCodeButton).toBeVisible();
    await copyCodeButton.click();

    // Assert the dropdown menu is closed
    await expect(dropdownMenu).not.toBeVisible();

    // Assert an alert is shown
    await expect(
      page.getByText(/Invitation code .{9} copied to clipboard/)
    ).toBeVisible();

    // Assert the invitation code is copied
    invitationCode = await page.evaluate(() => navigator.clipboard.readText());
    expect(invitationCode).toHaveLength(9);
  });

  test("Register test student", async ({ page }) => {
    await page.goto("/register/students");
    await page.getByLabel("Full name").fill(studentFullName);
    await page.getByLabel("Institutional ID").fill(studentInstitutionalID);
    await page.getByLabel("Email").fill(studentEmail);
    await page.getByLabel("Password").fill(studentPassword);

    await page.getByRole("button", { name: "Submit" }).click();
    await page.waitForURL(/\/login$/);
  });

  test("Students can join a course", async ({ page }) => {
    // Login as a student
    await page.goto("/login");
    await page.getByLabel("Email").fill(studentEmail);
    await page.getByLabel("Password").fill(studentPassword);
    await page.getByRole("button", { name: "Submit" }).click();

    // Join a course
    await page
      .getByRole("button", { name: "Join with an invitation code" })
      .click();

    // Use an unexistent code
    const nonExistentCode = "_________";
    await page.getByLabel("Code").fill(nonExistentCode);
    await page.getByRole("button", { name: "Join" }).click();

    // Assert an alert is shown
    await expect(
      page.getByText(`Course with invitation code ${nonExistentCode} not found`)
    ).toBeVisible();

    // Use an existent code
    await page.getByLabel("Code").fill(invitationCode);
    await page.getByRole("button", { name: "Join" }).click();

    // Assert an alert is shown
    await expect(page.getByText("You have joined the course")).toBeVisible();

    // Assert the modal is closed
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Assert the course is listed
    await expect(page.getByText(courseName)).toBeVisible();
  });

  test("Student is listed in the course", async ({ page }) => {
    // Login as a teacher
    await page.goto("/login");
    await page.getByLabel("Email").fill(teacherEmail);
    await page.getByLabel("Password").fill(teacherPassword);
    await page.getByRole("button", { name: "Submit" }).click();

    // Open the course page
    await page.getByRole("link", { name: courseName }).click();

    // Go to the participants view
    await page
      .getByRole("link", { name: "Manage participants", exact: true })
      .click();

    // Assert the student is listed
    const studentRow = page.getByRole("row", {
      name: new RegExp(studentFullName)
    });
    await expect(studentRow).toBeVisible();
    await expect(
      studentRow.getByRole("cell", { name: studentFullName })
    ).toBeVisible();
    await expect(
      studentRow.getByRole("cell", { name: studentInstitutionalID })
    ).toBeVisible();
    await expect(
      studentRow.getByRole("button", { name: "Deactivate", exact: true })
    ).toBeVisible();
  });
});
