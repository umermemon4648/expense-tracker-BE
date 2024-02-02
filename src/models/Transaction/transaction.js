const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
    },
    source: {
      type: String,
      enum: ["account", "cash", "savings"],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    amount: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
