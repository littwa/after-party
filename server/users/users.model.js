const {
  Schema,
  model,
  Types: { ObjectId },
} = require("mongoose");

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  avatarURL: { type: String, required: false },
  status: {
    type: String,
    required: true,
    enum: ["Not Verified", "Verified"],
    default: "Not Verified",
  },
  favoriteGoods: [{ type: ObjectId, ref: "Goods" }],
  cart: [{ type: ObjectId, ref: "Goods" }],
  verificationToken: { type: String, default: "" },
  sessionToken: { type: String, default: "" }, //, required: false
});

module.exports = model("Users", UserSchema);
