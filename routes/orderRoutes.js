const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");
const authenticateToken = require("../middlewares/authenticateToken")
const authorize = require("../middlewares/authorize")

router.post("/addorder",authenticateToken, orderController.addOrder);
router.get("/getorders",authenticateToken, orderController.getOrders);
router.get("/getorder/:id",authenticateToken, orderController.getOrder);
router.put("/updateorder/:id",authenticateToken, orderController.updateOrder);
router.delete("/delete/:id",authenticateToken, orderController.deleteOrder);
router.get("/get-user-orders/:userid",authenticateToken, orderController.getUserOrders);
router.get("/getorderscount",authenticateToken,orderController.ordersCount);
router.get("/totalsales",authenticateToken,authorize, orderController.totalSales);

module.exports = router;
