const baseUrl = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const userAToken = process.env.USER_A_ACCESS_TOKEN;
const userBToken = process.env.USER_B_ACCESS_TOKEN;

if (!userAToken || !userBToken) {
  console.error(
    "Set USER_A_ACCESS_TOKEN and USER_B_ACCESS_TOKEN to access tokens for two different test users.",
  );
  process.exit(1);
}

async function request(path, token, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { status: response.status, body };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function createTask(title) {
  const result = await request("/api/tasks", userAToken, {
    method: "POST",
    body: JSON.stringify({ title }),
  });

  assert(result.status === 201, `A could not create a test task (HTTP ${result.status}).`);
  assert(
    typeof result.body?.data?.id === "string",
    "The create-task response did not include a task ID.",
  );
  return result.body.data.id;
}

async function getUserATasks() {
  const result = await request("/api/tasks", userAToken);
  assert(result.status === 200, `A could not read tasks (HTTP ${result.status}).`);
  assert(Array.isArray(result.body?.data), "The task-list response was invalid.");
  return result.body.data;
}

async function deleteAsUserA(id) {
  return request(`/api/tasks/${encodeURIComponent(id)}`, userAToken, {
    method: "DELETE",
  });
}

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const patchTitle = `Ownership test patch ${suffix}`;
const deleteTitle = `Ownership test delete ${suffix}`;
const createdTaskIds = [];
const failures = [];

function check(condition, message, successMessage) {
  if (!condition) {
    failures.push(message);
    console.error(`FAIL: ${message}`);
    return;
  }
  console.log(`PASS: ${successMessage}`);
}

try {
  const patchTaskId = await createTask(patchTitle);
  createdTaskIds.push(patchTaskId);
  const deleteTaskId = await createTask(deleteTitle);
  createdTaskIds.push(deleteTaskId);

  const patchResult = await request(`/api/tasks/${encodeURIComponent(patchTaskId)}`, userBToken, {
    method: "PATCH",
    body: JSON.stringify({ title: "Changed by user B" }),
  });
  check(
    patchResult.status === 404,
    `Expected B's PATCH to return 404, received HTTP ${patchResult.status}.`,
    "B cannot edit a task owned by A (HTTP 404).",
  );

  const deleteResult = await request(`/api/tasks/${encodeURIComponent(deleteTaskId)}`, userBToken, {
    method: "DELETE",
  });
  check(
    deleteResult.status === 404,
    `Expected B's DELETE to return 404, received HTTP ${deleteResult.status}.`,
    "B cannot delete a task owned by A (HTTP 404).",
  );

  const userATasks = await getUserATasks();
  const patchTask = userATasks.find((task) => task.id === patchTaskId);
  const deleteTask = userATasks.find((task) => task.id === deleteTaskId);
  check(
    patchTask?.title === patchTitle,
    "A's task changed after B's PATCH attempt.",
    "A's task remains unchanged after B's PATCH attempt.",
  );
  check(
    deleteTask?.title === deleteTitle,
    "A's task is missing or changed after B's DELETE attempt.",
    "A's task remains present after B's DELETE attempt.",
  );
} catch (error) {
  failures.push(error instanceof Error ? error.message : "Ownership test failed.");
  console.error(`ERROR: ${failures[failures.length - 1]}`);
} finally {
  for (const id of createdTaskIds) {
    try {
      const result = await deleteAsUserA(id);
      if (result.status !== 200 && result.status !== 404) {
        failures.push(`Cleanup failed for test task ${id} (HTTP ${result.status}).`);
        console.error(`Cleanup failed for test task ${id} (HTTP ${result.status}).`);
      }
    } catch {
      failures.push(`Could not clean up test task ${id}.`);
      console.error(`Could not clean up test task ${id}.`);
    }
  }
}

if (failures.length) {
  process.exitCode = 1;
} else {
  console.log("All task-ownership checks passed.");
}
