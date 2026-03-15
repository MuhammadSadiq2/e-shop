const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/userController");
const authenticateToken = require("../middlewares/authenticateToken");
const authorize = require("../middlewares/authorize");

router.get("/getusers", authenticateToken, authorize, userControllers.getUsers);
router.get("/getuser/:id", authenticateToken, userControllers.getUser);
router.put(
  "/updateuser/:id",
  authenticateToken,
  userControllers.updateUserData,
);
router.delete("/deleteuser/:id", authenticateToken, userControllers.deleteUser);

module.exports = router;
