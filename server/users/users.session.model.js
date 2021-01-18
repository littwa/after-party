const { Schema, model } = require("mongoose");

const sessionSchema = new Schema({
  uid: { type: Schema.Types.ObjectId },
});

module.exports = model("Session", sessionSchema);
