const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const authenticateToken = require("../middlewares/authenticateToken");
const authorize = require("../middlewares/authorize");

router.post(
  "/addcategory",
  authenticateToken,
  authorize,
  categoryController.addCategory,
);
router.get(
  "/getcategories",
  authenticateToken,
  categoryController.getCategories,
);
router.get(
  "/getcategory/:id",
  authenticateToken,
  categoryController.getCategory,
);
router.put(
  "/updatecategory/:id",
  authenticateToken,
  authorize,
  categoryController.updateCategory,
);
router.delete(
  "/deletecategory/:id",
  authenticateToken,
  authorize,
  categoryController.deleteCategory,
);

module.exports = router;
