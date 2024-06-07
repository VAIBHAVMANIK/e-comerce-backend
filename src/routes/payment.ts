import express from "express";
import {
  applyDiscount,
  deleteCoupon,
  getallCoupon,
  newCoupon,
} from "../controller/payment";
import { adminAuth } from "../middleware/auth";

const app = express.Router();

//route--> /api/v1/payment/coupon/discount
app.get("/coupon/discount", applyDiscount);

//adminOnly
//route--> /api/v1/payment/coupon
app.post("/coupon/new", adminAuth, newCoupon);

//route--> /api/v1/payment/coupon/all
app.get("/coupon/all", adminAuth, getallCoupon);

app.delete("/coupon/:id", adminAuth, deleteCoupon);

export default app;
