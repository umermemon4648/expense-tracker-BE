const Category = require("../models/Category/category");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const validator = require("validator");
const Transaction = require("../models/Transaction/transaction");

const singleTransaction = async (req, res) => {
  try {
    const { type, source, amount, description, date } = req.body;
    const { categoryId } = req.params;
    if (!mongoose.isValidObjectId(categoryId)) {
      return ErrorHandler("Invalid category Id", 400, req, res);
    }
    if (!amount || !validator.isNumeric(amount)) {
      return ErrorHandler("Enter valid amount", 400, req, res);
    }
    if (
      validator.isEmpty(type) ||
      validator.isEmpty(source) ||
      validator.isEmpty(description)
    ) {
      return ErrorHandler("Complete Requried field", 400, req, res);
    }
    const data = await Transaction.create({
      user: req.user._id,
      type,
      source,
      amount,
      description,
      date,
    });
    return SuccessHandler({ message: "" }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  singleTransaction,
};
