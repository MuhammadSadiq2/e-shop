const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const rateLimiter = require("../middlewares/rateLimiter");

router.post("/register", authController.register);
router.post("/login", rateLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

module.exports = router;
