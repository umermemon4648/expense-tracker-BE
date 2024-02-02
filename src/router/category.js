const express = require("express");
const category = require("../controllers/categoryController");
const isAuthenticated = require("../middleware/auth");
const router = express.Router();

router.route("/add").post(isAuthenticated, category.addCatgeory);
router.route("/").get(isAuthenticated, category.getCategory);
router.route("/:categoryId").get(isAuthenticated, category.getSpecificCategory);
router.route("/:categoryId").put(isAuthenticated, category.updateCategory);
router.route("/").delete(isAuthenticated, category.deleteCategory);

module.exports = router;
