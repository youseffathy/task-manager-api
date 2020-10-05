const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/db/models/user");
const Task = require("../../src/db/models/task");

const userOneID = mongoose.Types.ObjectId();
const userOne = {
  _id: userOneID,
  name: "yousef",
  age: "23",
  email: "u1@gmail.com",
  password: "123123ss",
  tokens: [
    {
      token: jwt.sign({ _id: userOneID }, process.env.JWT_SECRET_KEY),
    },
  ],
};
const userTwoID = mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoID,
  name: "yousef2",
  age: "23",
  email: "u22@gmail.com",
  password: "123123ss",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoID }, process.env.JWT_SECRET_KEY),
    },
  ],
};

const taskOne = {
  _id: mongoose.Types.ObjectId(),
  description: "First task",
  completed: "false",
  owner: userOne._id,
};

const taskTwo = {
  _id: mongoose.Types.ObjectId(),
  description: "Second task",
  completed: "true",
  owner: userOne._id,
};

const taskThree = {
  _id: mongoose.Types.ObjectId(),
  description: "Third task",
  completed: "true",
  owner: userTwo._id,
};

const setupDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(userOne).save();
  await new User(userTwo).save();
  await new Task(taskOne).save();
  await new Task(taskTwo).save();
  await new Task(taskThree).save();
};

module.exports = {
  userOneID,
  userOne,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase,
  User,
  Task,
};
