import { Request } from "express";
import { TryCatch } from "../middleware/tryCatch";
import { NewCouponRequestBody } from "../types/types";
import ErrorHandler from "../utils/errorHandler";
import { Coupon } from "../models/coupon";

export const newCoupon = TryCatch(
  async (req: Request<{}, {}, NewCouponRequestBody>, res, next) => {
    const { amount, code } = req.body;
    if (!amount || !code)
      return next(new ErrorHandler("Please enter code and amount both", 400));
    const coupon = await Coupon.create({
      code,
      amount,
    });
    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
    });
  }
);
export const applyDiscount = TryCatch(async (req, res, next) => {
  const { code } = req.query;
  const coupon = await Coupon.findOne({ code });
  if (!coupon) return next(new ErrorHandler("Coupon not found", 404));
  res.status(200).json({
    success: true,
    discount: coupon.amount,
  });
});
export const getallCoupon = TryCatch(async (req, res, next) => {
  const coupon = await Coupon.find();
  if (!coupon) return next(new ErrorHandler("Coupon not found", 404));
  res.status(200).json({
    success: true,
    coupon,
  });
});

export const deleteCoupon = TryCatch(async (req, res, next) => {
  const  id  = req.params.id;
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) return next(new ErrorHandler("Coupon not found", 404));
  res.status(200).json({
    success: true,
    message: `Coupon ${coupon.code} deleted successfully`,
  });
});
