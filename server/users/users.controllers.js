const modelUsers = require("./users.model");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const nodemailer = require("nodemailer");

const { promises: fsPromises } = require("fs");
// const fs = require("fs");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");

const imageminMozjpeg = require("imagemin-mozjpeg");

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
    const isExistі = await modelUsers.findOne({ email: req.body.email });
    if (isExistі) {
      return res.status(400).send("email is exist");
    }

    const hashPassword = await bcrypt.hash(req.body.password, 5);

    const user = await modelUsers.create({
      ...req.body,
      password: hashPassword,
      avatarURL: "http://localhost:3000/images/" + req.file.filename,
    });

    Controllers.createAndSendVerifyToken(user._id, req.body.email);

    return res.status(201).send(user);
  };

  getUsers = async (req, res, next) => {
    const allUsers = await modelUsers.find();
    return res.status(200).send(allUsers);
  };

  static createAndSendVerifyToken = async (userId, userEmail) => {
    const token = uuid.v4();
    const { verificationToken } = await modelUsers.findByIdAndUpdate(
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
      const userForVerification = await modelUsers.findOneAndUpdate(
        { verificationToken },
        {
          status: "Verified",
          verificationToken: "",
        },
        { new: true, useFindAndModify: false },
      );

      console.log(1, req.params);
      console.log(2, userForVerification);

      if (!userForVerification) {
        throw new Error("404 User not found");
      }

      res.status(200).send("User verified successfully!");
    } catch (err) {
      next(err.message);
    }
  };
}

module.exports = new Controllers();

// verificationUser = async (req, res, next) => {
//   try {
//     const { verificationToken } = req.params;

//     const isUserForVerify = await modelUsers.findOne({ verificationToken });
//     if (!isUserForVerify) {
//       throw new Error("404 User not found");
//     }

//     await modelUsers.findByIdAndUpdate(
//       isUserForVerify._id,
//       {
//         status: "Verified",
//         verificationToken: "",
//       },
//       { new: true, useFindAndModify: false },
//     );

//     return res.status(200).send("User successfully verified!!!");
//   } catch (err) {
//     next(err.message);
//   }
// };
