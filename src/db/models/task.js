const mongoose = require("mongoose");
//set up task schema
const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

//define task model
const Task = mongoose.model("task", taskSchema);

module.exports = Task;
