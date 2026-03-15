const { populate } = require("dotenv");
const { Order } = require("../database/order");
const { OrderItem } = require("../database/orderItem");

exports.getOrders = async (req, res) => {
  const order = await Order.find()
    .populate("user", "username")
    .populate({
      path: "orderItem",
      populate: { path: "product", populate: "category" },
    });
  if (!order) {
    return res.status(400).json({ message: "orders not found" });
  }
  res.status(200).json({ order });
};
exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "username")
    .populate({
      path: "orderItem",
      populate: { path: "product", populate: "category" },
    });
  if (!order) {
    return res.status(400).json({ message: "order not found" });
  }
  res.status(200).json({ order });
};

exports.addOrder = async (req, res) => {
  const orderItems = Promise.all(
    req.body.orderItem.map(async (orderItemId) => {
      let newOrderItem = new OrderItem({
        product: orderItemId.product,
        quantity: orderItemId.quantity,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    }),
  );
  const resolvedOrderItems = await orderItems;

  const totalPrice = await Promise.all(
    resolvedOrderItems.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price",
      );
      const productsTotalPrice = orderItem.product.price * orderItem.quantity;
      return productsTotalPrice;
    }),
  );
  
  console.log(totalPrice)
  const totalPrices = totalPrice.reduce((a, b) => a + b, 0);

  const order = new Order({
    orderItem: resolvedOrderItems,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrices,
    user: req.body.user,
  });
  const newOrder = await order.save();
  if (!newOrder) {
    return res.status(400).json({ message: "order not saved" });
  }
  res.status(200).json({ newOrder });
};

exports.updateOrder = async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      orderItem: orderItems,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: req.body.totalPrice,
      user: req.body.user,
    },
    { new: true },
  );
  const updatedOrder = await order.save();
  if (!updatedOrder) {
    return res.status(400).json({ message: "order not updated" });
  }
  res.status(200).json({ updatedOrder });
};

exports.getUserOrders = async (req, res) => {
  const userOrders = await Order.find({user:req.params.userid})
    .populate({
      path: "orderItem",
      populate: { path: "product", populate: "category" },
    }).sort({orderingDate:-1});
  if (!userOrders) {
    return res.status(400).json({ message: "user order not found" });
  }
  res.status(200).json({ userOrders });
};

exports.deleteOrder = async (req, res) => {
  await Order.findByIdAndDelete(req.params.id)
    .then((order) => {
      if (order) {
        return res.status(200).json({ message: "order is removed" });
      } else {
        return res.status(404).json({ message: "order not found" });
      }
    })
    .catch((error) => {
      return res.status(400).json({ err: error });
    });
};


exports.ordersCount = async (req,res) => {
  const ordersCount = await Order.countDocuments()
  if(!ordersCount){
    return res.status(404).json({ message: "documents count could not be found" });
  }

  res.status(200).json({orders_count: ordersCount})
}

exports.totalSales = async (req,res) => {
  const totalSales = await Order.aggregate([
    {$group: {_id:null , totalsales : {$sum: "$totalPrice"}}}
  ])
  if(!totalSales){
      return res.status(404).json({ message: "total sales could not be generated" });
  }
  res.status(200).json({totalsales:totalSales.pop().totalsales})
}






