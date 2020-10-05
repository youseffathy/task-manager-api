const express = require("express");
const chalk = require("chalk");
const authentication = require("../middleware/authentication");
const Task = require("../db/models/task");

const router = express.Router();

/*-------------- Post endpoints --------------*/

//task creation endpoint
router.post("/tasks", authentication, async (req, res) => {
  if (!isValid(req.body)) {
    return res.status(400).send({ Error: "invalid information about task !!" });
  }
  const task = new Task({
    ...req.body, // copying body object inside task (es6)
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/*-------------- Get endpoints --------------*/

// GET all user's tasks endpoint
router.get("/tasks", authentication, async (req, res) => {
  const match = {}; // for search filter
  const sort = {}; // for sorting By specified fields
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split("_");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// GET task by id endpoint
router.get("/tasks/:id", authentication, async (req, res) => {
  const _id = req.params.id;
  try {
    // const task = await Task.findById(req.params.id);
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send({ error: "No task found with this ID !!" });
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/*-------------- Patch endpoints --------------*/

// Update task bi id endpoint
router.patch("/tasks/:id", authentication, async (req, res) => {
  if (!isValid(req.body)) {
    return res.status(400).send({ error: "invalid updates about task !!" });
  }
  try {
    const _id = req.params.id;
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send("No task found with given ID");
    }
    const updates = Object.keys(req.body);
    updates.forEach((update) => (task[update] = req.body[update]));
    task.save();
    res.status(202).send(task);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/*-------------- Delete endpoints --------------*/

// Delete task by id endpoint
router.delete("/tasks/:id", authentication, async (req, res) => {
  try {
    const _id = req.params.id;

    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send({ error: "No task found with this ID" });
    }
    res.status(200).send(task);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/*-------------- helper methods --------------*/

// validate information attached with request body
const isValid = (object) => {
  const allowedFields = ["description", "completed"];
  const fields = Object.keys(object);
  return fields.every((field) => {
    return allowedFields.includes(field);
  });
};

module.exports = router;
