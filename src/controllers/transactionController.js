const Category = require("../models/Category/category");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const validator = require("validator");
const Transaction = require("../models/Transaction/transaction");
const Wallet = require("../models/Wallet/wallet");
const mongoose = require("mongoose");
const moment = require("moment");

const createTransaction = async (req, res) => {
  // #swagger.tags = ['transaction']

  try {
    const transactionType = ["credit", "debit"];
    const sourceType = ["account", "cash", "savings"];
    const { type, source, amount, description, date } = req.body;
    const { categoryId } = req.params;
    if (!mongoose.isValidObjectId(categoryId)) {
      return ErrorHandler("Invalid category Id", 400, req, res);
    }
    const category = await Category.findOne({
      _id: categoryId,
      user: req.user._id,
    });
    if (!category) {
      return ErrorHandler("Category not found", 404, req, res);
    }
    if (isNaN(amount) || typeof amount !== "number") {
      return ErrorHandler("Enter valid amount", 400, req, res);
    }
    if (
      validator.isEmpty(type) ||
      validator.isEmpty(source) ||
      validator.isEmpty(description)
    ) {
      return ErrorHandler("Complete the Required field", 400, req, res);
    }
    const isWallet = await Wallet.findOne({ user: req.user._id });
    if (!isWallet) {
      return ErrorHandler(
        "Wallet not found, first create wallet",
        404,
        req,
        res
      );
    }
    const data = await Transaction.create({
      user: req.user._id,
      categoryId: categoryId,
      type,
      source,
      amount,
      description,
      date,
    });
    if (!transactionType.includes(type)) {
      return ErrorHandler("Type not exist", 404, req, res);
    }
    if (!sourceType.includes(source)) {
      return ErrorHandler("Souce type not exist", 404, req, res);
    }
    // type  debit
    let updatedField = {};
    if (type === "debit") {
      if (source === "account") {
        if (isWallet.accountBalance - amount >= 0) {
          updatedField.accountBalance = isWallet.accountBalance - amount;
        } else {
          return ErrorHandler("Amount cann't be debited", 400, req, res);
        }
      } else if (source === "savings") {
        if (isWallet.savingsAmount - amount >= 0) {
          updatedField.savingsAmount = isWallet.savingsAmount - amount;
        } else {
          return ErrorHandler("Amount cann't be debited", 400, req, res);
        }
      } else if (source === "cash") {
        if (isWallet.cashInHand - amount >= 0) {
          updatedField.cashInHand = isWallet.cashInHand - amount;
        } else {
          return ErrorHandler("Amount cann't be debited", 400, req, res);
        }
      }
    }
    // type credit
    if (type === "credit") {
      if (source === "account") {
        updatedField.accountBalance = isWallet.accountBalance + amount;
      } else if (source === "savings") {
        updatedField.savingsAmount = isWallet.savingsAmount + amount;
      } else if (source === "cash")
        updatedField.cashInHand = isWallet.cashInHand + amount;
    }
    await Wallet.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: updatedField,
      }
    );

    return SuccessHandler(
      { message: "Transaction Successfully", data: data },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getAllTransactions = async (req, res) => {
  // #swagger.tags = ['transaction']

  try {
    const { page = 1, pageSize = 10 } = req.query;
    const skipItems = (Number(page) - 1) * Number(pageSize);
    const data = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          $and: [
            req.query.search
              ? {
                  description: {
                    $regex: req.query.search,
                    $options: "i",
                  },
                }
              : {},
            req.query.dateFilter && req.query.dateFilter.length > 0
              ? {
                  date: {
                    $gte: new Date(
                      moment(req.query.dateFilter[0]).startOf("day").format()
                    ),
                    $lte: new Date(
                      moment(req.query.dateFilter[1]).endOf("day").format()
                    ),
                  },
                }
              : {},
          ],
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "CategoryDetail",
        },
      },
      {
        $unwind: "$CategoryDetail",
      },
      {
        $skip: skipItems,
      },
      {
        $limit: Number(pageSize),
      },
    ]);

    return SuccessHandler(
      { message: "Fetched Transactions", count: data.length, data: data },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateTransactions = async (req, res) => {
  // #swagger.tags = ['transaction']

  try {
    const { transactionId } = req.params;
    if (!mongoose.isValidObjectId(categoryId)) {
      return ErrorHandler("Invalid transaction Id", 400, req, res);
    }
    const category = await Category.findOne({
      _id: categoryId,
      user: req.user._id,
    });
    if (!category) {
      return ErrorHandler("Category not found", 404, req, res);
    }
    const transactionType = ["credit", "debit"];
    const sourceType = ["account", "cash", "savings"];
    const { type, source, amount, description, date } = req.body;
    const { categoryId } = req.params;
    if (!mongoose.isValidObjectId(categoryId)) {
      return ErrorHandler("Invalid category Id", 400, req, res);
    }
    if (!validator.isNumeric(amount)) {
      return ErrorHandler("Enter valid amount", 400, req, res);
    }
    if (
      validator.isEmpty(amount) ||
      validator.isEmpty(type) ||
      validator.isEmpty(source) ||
      validator.isEmpty(description)
    ) {
      return ErrorHandler("Complete the Required field", 400, req, res);
    }
    const isWallet = await Wallet.findOne({ user: req.user._id });
    if (!isWallet) {
      return ErrorHandler(
        "Wallet not found, first create wallet",
        404,
        req,
        res
      );
    }
    const data = await Transaction.findOne(
      { user: req.user._id, _id: transactionId },
      {
        user: req.user._id,
        categoryId: categoryId,
        type,
        source,
        amount,
        description,
        date,
      }
    );
    if (!transactionType.includes(type)) {
      return ErrorHandler("Type not exist", 404, req, res);
    }
    if (!sourceType.includes(source)) {
      return ErrorHandler("Souce type not exist", 404, req, res);
    }
    // type  debit
    let updatedField = {};
    if (type === "debit") {
      if (source === "account") {
        if (isWallet.accountBalance - amount > 0) {
          updatedField.accountBalance = isWallet.accountBalance - amount;
        } else {
          return ErrorHandler("Amount cann't be debited", 400, req, res);
        }
      } else if (source === "savings") {
        if (isWallet.savingsAmount - amount > 0) {
          updatedField.savingsAmount = isWallet.savingsAmount - amount;
        } else {
          return ErrorHandler("Amount cann't be debited", 400, req, res);
        }
      } else if (source === "cash") {
        if (isWallet.cashInHand - amount > 0) {
          updatedField.cashInHand = isWallet.cashInHand - amount;
        } else {
          return ErrorHandler("Amount cann't be debited", 400, req, res);
        }
      }
    }
    // type credit
    if (type === "credit") {
      if (source === "account") {
        updatedField.accountBalance = isWallet.accountBalance + amount;
      } else if (source === "savings") {
        updatedField.savingsAmount = isWallet.savingsAmount + amount;
      } else if (source === "cash")
        updatedField.cashInHand = isWallet.cashInHand + amount;
    }
    await Wallet.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: updatedField,
      }
    );

    return SuccessHandler(
      { message: "Transaction updated Successfully", data: data },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const getSingleTransaction = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(transactionId)) {
      return ErrorHandler("Invalid transaction Id", 400, req, res);
    }
    const { transactionId } = req.params;
    const data = await Transaction.findOne({
      user: req.user._id,
      _id: transactionId,
    });
    return SuccessHandler(
      { message: "Transaction Fetched", data: data },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const getAnalytics = async (req, res) => {
  // #swagger.tags = ['transaction']

  try {
    const data = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
        },
      },
      {
        $group: {
          _id: {
            month: {
              $month: "$date",
            },
            year: {
              $year: "$date",
            },
          },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          months: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id.month", 1] }, then: "January" },
                { case: { $eq: ["$_id.month", 2] }, then: "February" },
                { case: { $eq: ["$_id.month", 3] }, then: "March" },
                { case: { $eq: ["$_id.month", 4] }, then: "April" },
                { case: { $eq: ["$_id.month", 5] }, then: "May" },
                { case: { $eq: ["$_id.month", 6] }, then: "June" },
                { case: { $eq: ["$_id.month", 7] }, then: "July" },
                { case: { $eq: ["$_id.month", 8] }, then: "August" },
                { case: { $eq: ["$_id.month", 9] }, then: "September" },
                { case: { $eq: ["$_id.month", 10] }, then: "October" },
                { case: { $eq: ["$_id.month", 11] }, then: "November" },
                { case: { $eq: ["$_id.month", 12] }, then: "December" },
              ],
              default: "Month not found",
            },
          },
          totalAmount: 1,
        },
      },
    ]);
    return SuccessHandler({ message: "", data: data }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  updateTransactions,
  getAnalytics,
  getSingleTransaction,
};
