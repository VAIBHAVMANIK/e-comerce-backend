import express from "express";
import {
  deleteProduct,
  getProduct,
  getallCategories,
  getallProduct,
  getlatestProduct,
  newProduct,
  searchProduct,
  updateProduct,
} from "../controller/products";
import { adminAuth } from "../middleware/auth";
import { singleUplod } from "../middleware/multer";

const app = express.Router();

// route -->/api/v1/product

// route -->/api/v1/product/new
app.post("/new", adminAuth, singleUplod, newProduct);
// route -->/api/v1/product/latest
app.get("/latest", getlatestProduct);
// route -->/api/v1/product/category
app.get("/categories", getallCategories);

// admin routes
// route -->/api/v1/product/latest
app.get("/allproduct", adminAuth, getallProduct);
// route -->/api/v1/product/search/?query
app.get("/searchproducts", searchProduct);

//Dynamic route -->/api/v1/product/:id
app
  .route("/:id")
  .get(getProduct)
  .put(adminAuth, singleUplod, updateProduct)
  .delete(adminAuth, deleteProduct);

export default app;
