const express = require("express");
const { Product } = require("../database/product");
const { Category } = require("../database/category");
const { default: mongoose } = require("mongoose");

exports.getProducts = async (req, res) => {
  const products = await Product.find().populate("category", "name");

  if (!products) {
    return res.status(400).json({ message: "products not found" });
  }

  res.status(200).json({ products });
};

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name",
  );

  if (!product) {
    return res.status(400).json({ message: "product not found" });
  }

  res.status(200).json({ product });
};

exports.addProduct = async (req, res) => {
  const category = Category.findById(req.body.category);
  if (!category) return res.status(401).json({ message: "invalid category" });
  const file = req.file;
  if (!file) return res.status(401).json({ message: "image required" });
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    images: req.body.images,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    isFeatured: req.body.isFeatured,
  });
  const newProduct = await product.save();
  if (!newProduct) {
    return res.status(400).json({ message: "product not saved" });
  }
  res.status(200).json({ newProduct });
};

exports.updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      isFeatured: req.body.isFeatured,
    },
    { new: true },
  );
  const updatedProduct = await product.save();
  if (!updatedProduct) {
    return res.status(400).json({ message: "product not updated" });
  }
  res.status(200).json({ updatedProduct });
};

exports.addImages = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.productid)) {
    return res.status(401).json({ message: "invalid id" });
  }
  const files = req.files;
  let imagesPaths = [];
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  if (files) {
    files.map((file) => {
      imagesPaths.push(`${basePath}${file.filename}`);
    });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.productid,
    {
      images: imagesPaths,
    },
    { new: true },
  );
  const updatedProduct = await product.save();
  if (!updatedProduct) {
    return res.status(400).json({ message: "product not updated" });
  }
  res.status(200).json({ updatedProduct });
};

exports.productsCount = async (req, res) => {
  const productsCount = await Product.countDocuments();
  if (!productsCount) {
    return res
      .status(404)
      .json({ message: "products count could not be found" });
  }

  res.status(200).json({ products_count: productsCount });
};

exports.getFeauturedProducts = async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const featuredProducts = await Product.find({ isFeatured: true }).limit(
    +count,
  );
  if (!featuredProducts) {
    return res.status(404).json({ message: "cannot find featured products" });
  }
  res.json({ featuredProducts });
};

exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id)
    .then((product) => {
      if (product) {
        return res.status(200).json({ message: "product is removed" });
      } else {
        return res.status(404).json({ message: "product not found" });
      }
    })
    .catch((error) => {
      return res.status(400).json({ err: error });
    });
};
