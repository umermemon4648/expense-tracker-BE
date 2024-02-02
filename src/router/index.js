const router = require("express").Router();
const user = require("./user");
const category = require("./category");
const transaction = require("./transaction");
// const test = require("./wallet.js");

router.use("/user", user);
router.use("/category", category);
router.use("/transaction", transaction);

module.exports = router;
