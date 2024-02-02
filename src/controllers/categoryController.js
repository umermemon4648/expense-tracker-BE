const Category = require("../models/Category/category");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const validator = require("validator");
const mongoose = require("mongoose");

const addCatgeory = async (req, res) => {
  // #swagger.tags = ['category']

  const { category } = req.body;
  try {
    if (!category || validator.isEmpty(category)) {
      return ErrorHandler("Catgeory can't be empty", 400, req, res);
    }
    const isExist = await Category.findOne({
      user: req.user._id,
      category: { $regex: category, $options: "i" },
    });
    if (isExist) {
      return ErrorHandler("Category Already exist", 400, req, res);
    }
    const data = await Category.create({
      user: req.user._id,
      category,
    });
    return SuccessHandler({ message: "Category Added", data }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateCategory = async (req, res) => {
  // #swagger.tags = ['category']

  const { category } = req.body;
  const { categoryId } = req.params;

  try {
    if (validator.isEmpty(category)) {
      return ErrorHandler("Catgeory can't be empty", 400, req, res);
    }

    if (!mongoose.isValidObjectId(categoryId)) {
      return ErrorHandler("Invalid category Id", 400, req, res);
    }

    const data = await Category.findOneAndUpdate(
      {
        _id: categoryId,
        user: req.user._id,
      },
      {
        category,
      }
    );
    return SuccessHandler({ message: "Category Updated", data }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getCategory = async (req, res) => {
  // #swagger.tags = ['category']

  try {
    const data = await Category.find({
      user: req.user._id,
    });
    return SuccessHandler({ message: "Fetched Category", data }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getSpecificCategory = async (req, res) => {
  // #swagger.tags = ['category']

  try {
    const { categoryId } = req.params;
    if (!mongoose.isValidObjectId(categoryId)) {
      return ErrorHandler("Invalid category Id", 400, req, res);
    }

    const data = await Category.findOne({
      user: req.user._id,
      _id: categoryId,
    });
    return SuccessHandler({ message: "Fetched Category", data }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const deleteCategory = async (req, res) => {
  // #swagger.tags = ['category']

  const { categoryId } = req.params;

  try {
    if (!mongoose.isValidObjectId(categoryId)) {
      return ErrorHandler("Invalid category Id", 400, req, res);
    }

    const data = await Category.findOneAndUpdate(
      {
        _id: categoryId,
        user: req.user._id,
      },
      {
        $set: {
          isActive: true,
        },
      }
    );
    return SuccessHandler({ message: "Category Updated", data }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
module.exports = {
  addCatgeory,
  updateCategory,
  getCategory,
  getSpecificCategory,
  deleteCategory,
};
