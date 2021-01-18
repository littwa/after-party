const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

const GoodShema = new Schema({
  name: { type: String, default: "No name" },
  stars: { type: String, default: 0, enum: [0, 1, 2, 3, 4, 5] },
  description: { type: String, default: "No description" },
  price: { type: Number, required: true, default: 0 },
  inStock: {
    type: String,
    enum: ["In stock", "Not available", "Delivery expected"],
    default: "In stock",
    required: true,
  },
  reviews: { type: Array },
  photo: { type: Array },
});

module.exports = model("Good", GoodShema);
