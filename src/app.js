const express = require("express");
const chalk = require("chalk");
require("./db/DBConnection/mongoDBConnection");
const usersRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();

// tell express to parse request into JSON object
app.use(express.json());

app.use(usersRouter);
app.use(taskRouter);

module.exports = app;
