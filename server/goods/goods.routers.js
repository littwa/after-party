const goodsRoute = require("express").Router();
const goodsControllers = require("../goods/goods.controllers");

goodsRoute.post("/add", goodsControllers.addGoods);

module.exports = goodsRoute;
