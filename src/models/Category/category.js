const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },

    category: {
      type: String,
    },
  },
  { timestamps: true }
);
const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
