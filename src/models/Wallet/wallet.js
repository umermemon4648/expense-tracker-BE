const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const walletSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    accountBalance: {
      type: Number,
      default: 0,
    },
    savingsAmount: {
      type: Number,
      default: 0,
    },
    cashInHand: {
      type: Number,
      default: 0,
    },
    isCreated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;
