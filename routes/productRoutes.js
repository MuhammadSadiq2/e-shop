const express = require("express");
const router = express.Router();

const productRoutes = require("../controllers/productController");
const uploadOptions = require("../middlewares/imageHelper");
const authenticateToken = require("../middlewares/authenticateToken");
const authorize = require("../middlewares/authorize");

router.get("/getproducts", productRoutes.getProducts);
router.get("/getproduct/:id", productRoutes.getProductById);
router.post(
  "/addproduct",
  uploadOptions.single("image"),
  authenticateToken,
  productRoutes.addProduct,
);
router.put(
  "/updateproduct/:id",
  authenticateToken,
  productRoutes.updateProduct,
);
router.delete(
  "/deleteproduct/:id",
  authenticateToken,
  productRoutes.deleteProduct,
);
router.put(
  "/addimages/:productid",
  authenticateToken,
  uploadOptions.array("images", 10),
  productRoutes.addImages,
);
router.get(
  "/getfeatured/:count",
  authenticateToken,
  authorize,
  productRoutes.getFeauturedProducts,
);

module.exports = router;
