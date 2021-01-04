const express = require("express");
const usersRouter = express.Router();
const userControllers = require("./users.controllers");

usersRouter.post(
  "/",
  userControllers.multerMiddlware().single("avatar"),
  userControllers.imageMini,
  userControllers.signUpUser,
);
usersRouter.get("/", userControllers.getUsers);

usersRouter.get("/verify/:verificationToken", userControllers.verificationUser);

module.exports = usersRouter;
