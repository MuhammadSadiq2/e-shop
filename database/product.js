const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  richDescription: {
    type: String,
  },
  image: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
  }],
  brand: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"Category"
  },
  countInStock: {
    type: Number,
  },
  rating: {
    type: Number,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

productSchema.set("toJSON", { virtuals: true });

exports.Product = mongoose.model("Product", productSchema);
exports.productSchema = productSchema;
