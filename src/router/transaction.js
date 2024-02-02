const express = require("express");
const router = express.Router();
const transaction = require("../controllers/transactionController");
const isAuthenticated = require("../middleware/auth");

router
  .route("/:categoryId")
  .post(isAuthenticated, transaction.createTransaction);
router.route("/").get(isAuthenticated, transaction.getAllTransactions);
router
  .route("/:transactionId")
  .put(isAuthenticated, transaction.updateTransactions);
router
  .route("/:transactionId")
  .get(isAuthenticated, transaction.getSingleTransaction);
router.route("/analytics").get(isAuthenticated, transaction.getAnalytics);

module.exports = router;
