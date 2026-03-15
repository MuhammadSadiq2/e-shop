const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 3000;
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const rateLimiter = require("./middlewares/rateLimiter");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(rateLimiter);
app.use("/user", authRoutes);
app.use("/user", userRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/categories", categoryRoutes);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));

const corsOptions = {
  origin: ["http://localhost:5000"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log("database is not connected", err);
  });

app.listen(port, () => {
  console.log("listining on port 3000");
});
