const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/token", authController.createToken);

// Error handling middleware for this router
router.use((err, req, res, _next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

module.exports = router;
