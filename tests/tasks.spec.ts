import { expect, test, type Page } from "@playwright/test";

const email = process.env.TEST_EMAIL_A;
const password = process.env.TEST_PASSWORD_A;
const missingCredentials = [
  ...(!email ? ["TEST_EMAIL_A"] : []),
  ...(!password ? ["TEST_PASSWORD_A"] : []),
];
const missingCredentialsMessage =
  `Add the following variables to .env.local to run authenticated tests: ` +
  missingCredentials.join(", ");

async function signInAsUserA(page: Page) {
  if (!email || !password) {
    throw new Error(missingCredentialsMessage);
  }

  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByLabel("Email sinh viên / tài khoản").fill(email);
  await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
  const submitButton = page.getByRole("button", { name: "Đăng nhập" });
  await submitButton.click();
  await page.waitForURL("**/tasks", { waitUntil: "commit" });
}

async function getAccessToken(page: Page) {
  const accessToken = await page.evaluate(() => {
    const storageKey = Object.keys(window.localStorage).find(
      (key) => key.startsWith("sb-") && key.endsWith("-auth-token"),
    );
    if (!storageKey) return null;

    try {
      const session: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");
      if (
        typeof session === "object" &&
        session !== null &&
        "access_token" in session &&
        typeof session.access_token === "string"
      ) {
        return session.access_token;
      }
    } catch {
      return null;
    }

    return null;
  });

  if (!accessToken) {
    throw new Error("Could not retrieve the signed-in test session.");
  }

  return accessToken;
}

async function cleanupTasks(
  page: Page,
  accessToken: string,
  createdTitles: string[],
  createdIds: string[],
) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const ids = new Set(createdIds);
  if (ids.size < createdTitles.length) {
    const response = await page.request.get("/api/tasks", { headers, timeout: 5_000 });
    if (!response.ok()) {
      throw new Error(`Could not list test-user tasks for cleanup (HTTP ${response.status()}).`);
    }

    const body: unknown = await response.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("data" in body) ||
      !Array.isArray(body.data)
    ) {
      throw new Error("Could not identify test-created tasks for cleanup.");
    }

    for (const task of body.data) {
      if (
        typeof task === "object" &&
        task !== null &&
        "id" in task &&
        typeof task.id === "string" &&
        "title" in task &&
        typeof task.title === "string" &&
        createdTitles.includes(task.title)
      ) {
        ids.add(task.id);
      }
    }
  }

  for (const id of ids) {
    const deleteResponse = await page.request.delete(`/api/tasks/${encodeURIComponent(id)}`, {
      headers,
    });
    if (deleteResponse.status() !== 200 && deleteResponse.status() !== 404) {
      throw new Error(`Could not remove a test-created task (HTTP ${deleteResponse.status()}).`);
    }
  }
}

test("tasks API rejects requests without an access token", async ({ request }) => {
  const response = await request.get("/api/tasks");
  expect(response.status()).toBe(401);
});

test.describe("authenticated task workflow", () => {
  test.skip(
    missingCredentials.length > 0,
    missingCredentialsMessage,
  );

  test("Pomodoro timer counts down and can pause and resume", async ({ page }) => {
    await signInAsUserA(page);

    const pomodoroCard = page.getByRole("region", { name: "Đồng hồ Pomodoro" });
    const timer = pomodoroCard.getByRole("timer", { name: "Thời gian Pomodoro" });
    let toggleButton = pomodoroCard.getByRole("button", { name: "Bắt đầu" });

    await expect(timer).toHaveText("25:00");
    await toggleButton.click();
    toggleButton = pomodoroCard.getByRole("button", { name: "Tạm dừng" });
    await expect(toggleButton).toHaveAccessibleName("Tạm dừng");
    await expect(toggleButton).toHaveAttribute("aria-pressed", "true");
    await expect.poll(async () => {
      const [minutes, seconds] = (await timer.innerText()).split(":").map(Number);
      return minutes * 60 + seconds;
    }).toBeLessThan(25 * 60);

    await toggleButton.click();
    toggleButton = pomodoroCard.getByRole("button", { name: "Tiếp tục" });
    await expect(toggleButton).toHaveAccessibleName("Tiếp tục");
    await expect(toggleButton).toHaveAttribute("aria-pressed", "false");

    await pomodoroCard.getByRole("button", { name: "Đặt lại Pomodoro" }).click();
    await expect(timer).toHaveText("25:00");
    toggleButton = pomodoroCard.getByRole("button", { name: "Bắt đầu" });
    await expect(toggleButton).toHaveAccessibleName("Bắt đầu");

    await toggleButton.click();
    toggleButton = pomodoroCard.getByRole("button", { name: "Tạm dừng" });
    await expect(toggleButton).toHaveAccessibleName("Tạm dừng");
    await expect(toggleButton).toHaveAttribute("aria-pressed", "true");
  });

  test("signs in, persists, edits, completes, and deletes a task", async ({ page }) => {
    test.setTimeout(90_000);
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const originalTitle = `Playwright task ${uniqueSuffix}`;
    const editedTitle = `Playwright task edited ${uniqueSuffix}`;
    const createdIds: string[] = [];
    let accessToken: string | undefined;
    let currentStep = "signing in";
    let workflowError: unknown;

    try {
      await signInAsUserA(page);
      accessToken = await getAccessToken(page);

      currentStep = "creating the task";
      const createResponsePromise = page.waitForResponse(
        (response) =>
          response.url().endsWith("/api/tasks") &&
          response.request().method() === "POST",
      );
      await page.getByLabel("Tên công việc").fill(originalTitle);
      await page.getByRole("button", { name: "Thêm công việc" }).click();

      const createResponse = await createResponsePromise;
      expect(createResponse.status()).toBe(201);
      const createBody: unknown = await createResponse.json();
      if (
        typeof createBody === "object" &&
        createBody !== null &&
        "data" in createBody &&
        typeof createBody.data === "object" &&
        createBody.data !== null &&
        "id" in createBody.data &&
        typeof createBody.data.id === "string"
      ) {
        createdIds.push(createBody.data.id);
      }

      let taskRow = page.getByTestId("task-item").filter({ hasText: originalTitle });
      await expect(taskRow).toBeVisible();

      currentStep = "checking task persistence after reload";
      await page.reload();
      taskRow = page.getByTestId("task-item").filter({ hasText: originalTitle });
      await expect(taskRow).toBeVisible();

      currentStep = "editing the task";
      await taskRow.getByRole("button", { name: `Chỉnh sửa: ${originalTitle}` }).click();
      const editingRow = page
        .getByTestId("task-item")
        .filter({ has: page.getByLabel("Chỉnh sửa công việc") });
      await editingRow.getByLabel("Chỉnh sửa công việc").fill(editedTitle);
      await editingRow.getByRole("button", { name: "Lưu" }).click();

      currentStep = "marking the task complete";
      taskRow = page.getByTestId("task-item").filter({ hasText: editedTitle });
      await expect(taskRow).toBeVisible();
      await taskRow.getByRole("button", { name: `Đánh dấu hoàn thành: ${editedTitle}` }).click();
      await page.getByRole("button", { name: /Đã xong/ }).click();
      taskRow = page.getByTestId("task-item").filter({ hasText: editedTitle });
      await expect(
        taskRow.getByRole("button", { name: `Đánh dấu chưa xong: ${editedTitle}` }),
      ).toHaveAttribute("aria-pressed", "true");

      currentStep = "deleting the task";
      await taskRow.getByRole("button", { name: `Xóa: ${editedTitle}` }).click();
      const deleteDialog = page.getByRole("alertdialog", { name: "Xóa công việc?" });
      await deleteDialog.getByRole("button", { name: "Xóa công việc" }).click();
      await expect(page.getByTestId("task-item").filter({ hasText: editedTitle })).toHaveCount(0);
    } catch (error) {
      workflowError = error;
    } finally {
      if (accessToken) {
        try {
          await cleanupTasks(page, accessToken, [originalTitle, editedTitle], createdIds);
        } catch (cleanupError) {
          const message =
            cleanupError instanceof Error ? cleanupError.message : "Unknown cleanup failure.";
          if (workflowError) {
            console.error(`Test data cleanup failed: ${message}`);
          } else {
            workflowError = cleanupError;
          }
        }
      }
    }

    if (workflowError) {
      const message =
        workflowError instanceof Error ? workflowError.message : "Unknown test failure.";
      throw new Error(`Task workflow failed while ${currentStep}: ${message}`);
    }
  });

  test("tasks API rejects invalid input with an authenticated request", async ({ page }) => {
    await signInAsUserA(page);
    const accessToken = await getAccessToken(page);

    const response = await page.request.post("/api/tasks", {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { title: "" },
    });

    expect(response.status()).toBe(400);
  });
});
