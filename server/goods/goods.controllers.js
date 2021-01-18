const ModelGoods = require("./goods.model");
const ModelUsers = require("../users/users.model");
const multer = require("multer");
const path = require("path");
const {
  Types: { ObjectId },
} = require("mongoose");
const { promises: fsPromises } = require("fs");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const imageminMozjpeg = require("imagemin-mozjpeg");

class Controllers {
  // getAllGoods = async(req, res, next)=>{

  // }

  addGoods = async (req, res, next) => {
    try {
      const newGoods = await ModelGoods.create(req.body);
      return res.status(201).send(newGoods);
    } catch (err) {
      next(err.message);
    }
  };
}

module.exports = new Controllers();
