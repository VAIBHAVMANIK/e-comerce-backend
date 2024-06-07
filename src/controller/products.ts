import { Request } from "express";
import { rm } from "fs";
import { myCache } from "../app";
import { TryCatch } from "../middleware/tryCatch";
import { Product } from "../models/products";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types";
import ErrorHandler from "../utils/errorHandler";
import cacheRevalidation from "../utils/cacheRevalidation";

//Revalidation of cache on NewProduct,DeleteProduct and UpdateProduct
export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, category, price, stock } = req.body;
    const photo = req.file;

    if (!photo) {
      return next(new ErrorHandler("Please add a photo", 400));
    }
    if (!name || !category || !price || !stock) {
      rm(photo.path, () => {
        console.log("file deleted");
      });
      return next(new ErrorHandler("Please enter all fields", 400));
    }
    const product = await Product.create({
      name,
      category: category.toLowerCase(),
      price,
      stock,
      photo: photo?.path,
    });
    await cacheRevalidation({ products: true });
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  }
);

export const getlatestProduct = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("latest-product")) {
    products = JSON.parse(myCache.get("latest-product") as string);
  } else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    myCache.set("latest-product", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});
export const getallCategories = TryCatch(async (req, res, next) => {
  let categories;
  if (myCache.has("categories")) {
    categories = JSON.parse(myCache.get("categories") as string);
  } else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }
  return res.status(200).json({
    success: true,
    categories,
  });
});
export const getProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;
  if (myCache.has(`product-${id}`)) {
    product = JSON.parse(myCache.get(`product-${id}`) as string);
  } else {
    product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("Product not found", 404));
    myCache.set(`product-${id}`, JSON.stringify(product));
  }
  return res.status(200).json({
    success: true,
    product,
  });
});

export const getallProduct = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("all-products")) {
    products = JSON.parse(myCache.get("all-products") as string);
  } else {
    products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

export const updateProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const { name, category, price, stock } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  if (photo) {
    rm(product.photo, () => {
      console.log("Old Photo deleted");
    });
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (category) product.category = category.toLowerCase();
  if (price) product.price = price;
  if (stock) product.stock = stock;

  await product.save();
  await cacheRevalidation({ products: true, productId: String(product._id) });

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product not found", 404));
  rm(product.photo, () => {
    console.log("photo deleted");
  });
  await product.deleteOne();
  await cacheRevalidation({ products: true, productId: String(product._id) });
  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

export const searchProduct = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, category, price, sort } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_LIMIT) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: BaseQuery = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };

    if (category) baseQuery.category = category;
    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };

    const [products, filteredProductOnly] = await Promise.all([
      await Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip),
      await Product.find(baseQuery),
    ]);
    const totalPages = Math.ceil(filteredProductOnly.length / limit);

    res.status(200).json({
      success: true,
      products,
      totalPages,
    });
  }
);
