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

usersRouter.post("/signin", userControllers.signInUser);

usersRouter.post("/sign-out", userControllers.authorize, userControllers.signOut);

usersRouter.post("/refresh", userControllers.refreshToken);

usersRouter.post("/add-favorite-good", userControllers.authorize, userControllers.addFavoriteGood);

usersRouter.delete("/del-good/:goodId", userControllers.authorize, userControllers.delFavoriteGood);

usersRouter.get("/get-favorite-goods", userControllers.authorize, userControllers.getFavoriteGoods);

//-----------------TEST---------------------------------------------------------------
usersRouter.get("/test", userControllers.authorize, async (req, res, next) => {
  res.send({ u: req.user, s: req.session, t: req.session._id.getTimestamp() });
});

//-------------------------------------------------------------------------------------

module.exports = usersRouter;
