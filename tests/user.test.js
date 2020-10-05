const request = require("supertest");
const app = require("../src/app");
const { userOneID, userOne, userTwo, taskOne, taskTwo, taskThree, setupDatabase, User } = require("./fixtures/db");

beforeAll(setupDatabase);

test("should sign up a new user with assertions", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "yousef",
      age: "23",
      email: "u2@gmail.com",
      password: "123123ss",
    })
    .expect(201);

  const user = User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  expect(response.body).toMatchObject({
    user: { name: "yousef", email: "u2@gmail.com" },
  });

  expect(user.password).not.toBe("123123ss");
});

test("should login existing user", async () => {
  const response = await request(app)
    .post("/users/login")
    .send({
      email: "u1@gmail.com",
      password: "123123ss",
    })
    .expect(200);
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  expect(response.body.token).toBe(user.tokens[1].token);
});

test("should not login with non existing user", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: "u3@gmail.com",
      password: "123123ss",
    })
    .expect(400);
});

test("should get profile for user", async () => {
  await request(app).get("/users/me").set("Authorization", `Bearer ${userOne.tokens[0].token}`).send().expect(201);
});

test("should not get profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/avatar.jpg")
    .expect(202);

  const user = await User.findById(userOne._id);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("should update valid user field", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ name: "youseff" })
    .expect(202);
});

test("should not update non valid user field", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ location: "youseff" })
    .expect(400);

  const user = await User.findById(userOne._id);
  expect(user.name).toBe("youseff");
});

test("should delete account for user", async () => {
  const response = await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(response.body._id);
  expect(user).toBeNull();
});

test("should not delete account for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});
