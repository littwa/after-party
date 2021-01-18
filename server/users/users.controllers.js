const ModelUsers = require("./users.model");
const ModelSession = require("./users.session.model");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const {
  Types: { ObjectId },
} = require("mongoose");
const { promises: fsPromises } = require("fs");
// const fs = require("fs");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const imageminMozjpeg = require("imagemin-mozjpeg");
// const { send } = require("@sendgrid/mail");

class Controllers {
  multerMiddlware = () => {
    const storage = multer.diskStorage({
      destination: "tmp",
      filename: function (req, file, cb) {
        const ext = path.parse(file.originalname).ext;
        cb(null, Date.now() + ext);
      },
    });

    return multer({ storage });
  };

  imageMini = async (req, res, next) => {
    if (!req.file) {
      return next();
    }
    try {
      const MINI_IMG = "public/images";
      await imagemin([`${req.file.destination}/*.{jpg,png}`], {
        destination: MINI_IMG,
        plugins: [
          imageminMozjpeg(),
          imageminPngquant({
            quality: [0.3, 0.5],
          }),
        ],
      });

      const { filename, path: draftPath } = req.file;

      await fsPromises.unlink(draftPath);

      req.file = {
        ...req.file,
        path: path.join(MINI_IMG, filename),
        destination: MINI_IMG,
      };

      next();
    } catch (err) {
      next(err);
    }
  };

  signUpUser = async (req, res, next) => {
    const isExistі = await ModelUsers.findOne({ email: req.body.email });
    if (isExistі) {
      return res.status(400).send("email is exist");
    }

    const hashPassword = await bcrypt.hash(req.body.password, 5);

    const user = await ModelUsers.create({
      ...req.body,
      password: hashPassword,
      avatarURL: "http://localhost:3000/images/" + req.file.filename,
    });

    Controllers.createAndSendVerifyToken(user._id, req.body.email);

    return res.status(201).send(user);
  };

  getUsers = async (req, res, next) => {
    const allUsers = await ModelUsers.find();
    return res.status(200).send(allUsers);
  };

  static createAndSendVerifyToken = async (userId, userEmail) => {
    const token = uuid.v4();
    const { verificationToken } = await ModelUsers.findByIdAndUpdate(
      userId,
      {
        verificationToken: token,
      },
      { new: true, useFindAndModify: false },
    );

    const transporter = nodemailer.createTransport({
      // service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 587, false for other ports
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const verificationURL = `${
      process.env.HEROKU_URI
        ? process.env.HEROKU_URI + "/users/verify/"
        : "http://localhost:3000/users/verify/"
    }${verificationToken}`;

    // const verificationUrl = `http://localhost:3000/auth/verify/${verificationToken}`;

    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: userEmail,
      subject: "Email Verification",
      html: `<a href='${verificationURL}'>Click here for verification!</a>`,
    };

    return transporter.sendMail(mailOptions);
  };

  verificationUser = async (req, res, next) => {
    try {
      const { verificationToken } = req.params;
      const userForVerification = await ModelUsers.findOneAndUpdate(
        { verificationToken },
        {
          status: "Verified",
          verificationToken: "",
        },
        { new: true, useFindAndModify: false },
      );

      // console.log(1, req.params);
      // console.log(2, userForVerification);

      if (!userForVerification) {
        throw new Error("404 User not found");
      }

      res.status(200).send("User verified successfully!"); // .redirect('https://kidslike-front-end.netlify.app/login')
    } catch (err) {
      next(err.message);
    }
  };

  signInUser = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await ModelUsers.findOne({ email });
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!user) {
        return res.status(400).send({ message: "User was not found" });
      }
      if (!isPasswordValid) {
        return res.status(400).send({ message: "Password wrong" });
      }
      if (user.status !== "Verified") {
        return res.status(400).send({ message: "User not verified" });
      }
      const userObjectId = ObjectId(user._id);

      const createSession = await ModelSession.create({
        uid: userObjectId,
      });

      const accessToken = await jwt.sign(
        { sid: createSession._id, uid: createSession.uid },
        process.env.TOKEN_SECRET ? process.env.TOKEN_SECRET : "qwerty",
        { expiresIn: "24h" },
      );
      const refreshToken = await jwt.sign(
        { sid: createSession._id, uid: createSession.uid },
        process.env.TOKEN_SECRET ? process.env.TOKEN_SECRET : "qwerty",
        { expiresIn: "30d" },
      );

      // console.log(11, user._id); ////////
      // console.log(1, userObjectId); ////////
      // console.log(2, createSession); ////////
      // console.log(3, accessToken); ////////
      // console.log(4, refreshToken); ////////
      // let verify1 = await jwt.verify(accessToken, process.env.TOKEN_SECRET);
      // let verify = await jwt.verify(refreshToken, process.env.TOKEN_SECRET);
      // console.log(5, verify1); ////////
      // console.log(6, verify); ////////

      return res.status(200).send({
        name: user.name,
        email: user.email,
        avatarURL: user.avatarURL,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } catch (err) {
      next(err.message);
    }
  };

  authorize = async (req, res, next) => {
    try {
      const authorizHeader = req.get("Authorization") || "";
      const token = authorizHeader.slice(7);

      if (!token) {
        return res.status(401).send("Not authorized");
      }
      let parsedToken;

      try {
        parsedToken = await jwt.verify(token, process.env.TOKEN_SECRET);
      } catch (err) {
        // next(err.message);

        return res.status(401).send("Not authorized");
      }
      // if (!parsedToken) {
      //   return res.status(401).send("Not authorized");
      // }

      let session = await ModelSession.findOne({ _id: parsedToken.sid });
      let user = await ModelUsers.findOne({ _id: parsedToken.uid });

      if (!session && !user && user._id !== session.uid) {
        return res.status(401).send("Not authorized");
      }
      req.user = user;
      req.session = session;
      next();
    } catch (err) {
      next(err.message);
    }
  };

  signOut = async (req, res, next) => {
    try {
      const token = (req.get("Authorization") || "").slice(7);
      console.log(req.session._id);
      console.log(req.session.uid);

      await ModelSession.findByIdAndDelete(req.session._id);
      return res.send({ idLogOutedUser: req.session.uid });
    } catch (err) {
      next(err);
    }
  };

  refreshToken = async (req, res, next) => {
    try {
      const token = req.get("Authorization" || "").slice(7);
      let parsedToken;
      try {
        parsedToken = await jwt.verify(token, process.env.TOKEN_SECRET);
      } catch (err) {
        // console.log(1, err.expiredAt); // .getTime()
        // console.log(1, err.message);
        // await ModelSession.findByIdAndDelete(parsedToken.sid);
        return res.status(401).send("Not authorized");
        // next(err);
      }

      let session = await ModelSession.findById(parsedToken.sid);
      let user = await ModelUsers.findById(parsedToken.uid);

      if (!user && !session && user._id !== session.uid) {
        return res.status(401).send("Not authorized");
      }

      await ModelSession.findByIdAndDelete(parsedToken.sid);

      const newSession = await ModelSession.create({ uid: parsedToken.uid });

      let accessToken = jwt.sign(
        { uid: parsedToken.uid, sid: newSession._id },
        process.env.TOKEN_SECRET,
        { expiresIn: "24h" },
      );
      let refreshToken = jwt.sign(
        { uid: parsedToken.uid, sid: newSession._id },
        process.env.TOKEN_SECRET,
        { expiresIn: "30d" },
      );

      return res.status(200).send({ accessToken, refreshToken });
    } catch (err) {
      next(err.message);
    }
  };
  //------------------------------ADD-FAVORITE---ADD-CART-----GET USER WITH FAVORIT---------------

  addFavoriteGood = async (req, res, next) => {
    try {
      const { user } = req;

      // const withFavoriteGood = await ModelUsers.findByIdAndUpdate(
      //   user._id,
      //   { $push: { favoriteGoods: ObjectId(req.body.good) } },
      //   { new: true },
      // );

      const withFavoriteGood = await ModelUsers.findById(user._id);
      if (withFavoriteGood.favoriteGoods.includes(ObjectId(req.body.good))) {
        return res.status(400).send("isAdded earlier");
      }
      withFavoriteGood.favoriteGoods.push(ObjectId(req.body.good));
      withFavoriteGood.save();

      return res.status(200).send(withFavoriteGood);
    } catch (err) {
      next(err.message);
    }
  };

  delFavoriteGood = async (req, res, next) => {
    try {
      let userToUpdate = await ModelUsers.findById(req.user._id);

      let withoutGood = userToUpdate.favoriteGoods.filter(
        el => el._id.toString() !== req.params.goodId,
      );

      userToUpdate.favoriteGoods = withoutGood;

      userToUpdate.save();
      return res.status(200).send(`Deleted good from favorite ${req.params.goodId}`);
    } catch (err) {
      next(err.message);
    }
  };

  getFavoriteGoods = async (req, res, next) => {
    try {
      const userAgregateFavoriteGoods = await ModelUsers.aggregate([
        { $match: { _id: ObjectId(req.user._id) } },
        {
          $lookup: {
            from: "goods",
            localField: "favoriteGoods",
            foreignField: "_id",
            as: "agregGoods",
          },
        },
      ]);
      return res.status(200).send(userAgregateFavoriteGoods);
    } catch (err) {
      next(err.message);
    }
  };
  //------------------------------ADD-FAVORITE---ADD-CART------GET USER WITH FAVORIT--------------
}

module.exports = new Controllers();
