const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");
const { Timestamp } = require("mongodb");
//set up user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Username",
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid !");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(password) {
        if (password.toLowerCase().includes("password")) {
          throw new Error('password can not include "password" !');
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      //min: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be a positive number !");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  { timestamps: true } // to add createdAt, updatedAt fields in schema
);

// adding relation between user and his/her tasks
userSchema.virtual("tasks", {
  ref: "task",
  localField: "_id",
  foreignField: "owner",
});

//method to verify username and password for logging in
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new Error("No user found with this email");
  }
  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) {
    throw new Error("Incorrect password");
  }
  return user;
};

// method to generate authentication token for username
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_KEY);
  user.tokens = user.tokens.concat({ token: token });
  await user.save();
  return token;
};

// method to edit attributes to be shown when res.send(user) called
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  delete user.avatar;
  return user;
  // OR
  /* const { name, age, email, _id, __V} = this;
  return { name, age, email, _id }; */
};

// a middleware methods to hash password before saving
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

// a middleware to delete user's tasks after deleting that username
userSchema.pre("remove", async function (next) {
  const user = this;
  Task.deleteMany({ owner: user._id });
  next();
});

//define user model
const User = mongoose.model("user", userSchema);

module.exports = User;
