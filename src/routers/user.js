const express = require("express");
const chalk = require("chalk");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../db/models/user");
const authentication = require("../middleware/authentication");
const auth = require("../middleware/authentication");
const emailSender = require("../emails/account");

const router = express.Router();

/*-------------- Post endpoints --------------*/

// user creation endpoint
router.post("/users", async (req, res) => {
  if (!isValid(req.body)) {
    return res.status(400).send({ Error: "invalid information about user !!" });
  }

  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    emailSender.sendWelcomeEmail(user.email, user.name);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// login endpoint
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
  } catch (error) {
    res.status(400).send({ error: error.message }); // error sent as empty string ??
  }
});

// Logout from current session endpoint
router.post("/users/logout", authentication, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// logout from all sessions endpoint
router.post("/users/logoutAll", authentication, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Upload user avatar endpoint
//adding uploading constraints and validations
const upload = multer({
  limits: {
    fileSize: 2000000,
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error("only jpg or png files accepted!"));
    }
    callback(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  authentication,
  upload.single("avatar"),
  async (req, res, next) => {
    if (!req.file) {
      return next(new Error("no avatar uploaded"));
    }
    req.user.avatar = await sharp(req.file.buffer).resize(250, 250).png().toBuffer();
    await req.user.save();
    res.status(202).send("image uploaded");
  },
  (error, req, res, next) => {
    if (error.message === "File too large") {
      error.message = "File size is larger than 2 MB";
    }
    res.status(400).send({ error: error.message });
  }
);

/*-------------- Get endpoints --------------*/

// Get user profile endpoint
router.get("/users/me", authentication, async (req, res) => {
  res.status(201).send(req.user);
});

//Get user's avatar by id endpoint
router.get("/users/:id/avatar", authentication, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new Error("no user found with this ID");
    } else if (!user.avatar) {
      throw new Error("User has no avatar");
    }

    res.set("Content-Type", "image/jpg");
    res.status(200).send(user.avatar);
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
});

/*-------------- Patch endpoints --------------*/

// update user endpoint
router.patch("/users/me", authentication, async (req, res) => {
  if (!isValid(req.body)) {
    return res.status(400).send({ Error: "invalid updates about user !!" });
  }
  try {
    const updates = Object.keys(req.body);
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(202).send(req.user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

/*-------------- Delete endpoints --------------*/

// Delete user's account endpoint
router.delete("/users/me", authentication, async (req, res) => {
  try {
    //const user = await User.findByIdAndDelete(req.user._id);
    await req.user.remove();
    emailSender.sendCancellationEmail(req.user.email, req.user.name);
    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

//Delete avatar endpoint
router.delete("/users/me/avatar", authentication, async (req, res) => {
  try {
    if (!req.user.avatar) {
      throw new Error("User has no avatar");
    }
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send("Avatar Deleted");
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

/*-------------- helper methods--------------*/

// validate information attached with request body
const isValid = (object) => {
  const allowedFields = ["name", "age", "email", "password"];
  const fields = Object.keys(object);
  return fields.every((field) => {
    return allowedFields.includes(field);
  });
};

module.exports = router;
