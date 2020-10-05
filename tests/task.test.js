const request = require("supertest");
const app = require("../src/app");
const { userOneID, userOne, userTwo, taskOne, taskTwo, taskThree, setupDatabase, Task } = require("./fixtures/db");

beforeAll(setupDatabase);

test("should create task for user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "From testing",
      completed: "false",
    })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.description).toBe("From testing");
});

test("get tasks of user", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("should not delete others' tasks", async () => {
  const response = request(app)
    .delete(`/tasks/${taskThree._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(400);
});
