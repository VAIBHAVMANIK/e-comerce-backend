import { Request } from "express";
import { TryCatch } from "../middleware/tryCatch";
import { NewOrderRequestBody } from "../types/types";
import { Order } from "../models/order";
import reduceStock from "../utils/reduceStock";
import cacheRevalidation from "../utils/cacheRevalidation";
import ErrorHandler from "../utils/errorHandler";
import { myCache } from "../app";

export const newOrder = TryCatch(
  async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {
    const {
      discount,
      orderItems,
      shippingAddress,
      shippingCharges,
      subtotal,
      tax,
      total,
      userInfo,
    } = req.body;

    if (
      !orderItems ||
      !shippingAddress ||
      !shippingCharges ||
      !subtotal ||
      !tax ||
      !total ||
      !userInfo
    )
      return next(new ErrorHandler("Please enter all required fields", 400));

    const order = await Order.create({
      discount,
      orderItems,
      shippingAddress,
      shippingCharges,
      subtotal,
      tax,
      total,
      userInfo,
    });
    await reduceStock(orderItems);
    await cacheRevalidation({
      products: true,
      order: true,
      admins: true,
      userId: userInfo,
      productId: orderItems.map((i) => i.productId),
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  }
);

export const myOrders = TryCatch(async (req, res, next) => {
  const { id: userInfo } = req.query;
  let orders;
  if (myCache.has(`my-orders-${userInfo}`)) {
    orders = JSON.parse(myCache.get(`my-orders-${userInfo}`) as string);
  } else {
    orders = await Order.find({ userInfo });
    if (!orders) return next(new ErrorHandler("No Order found", 404));
    myCache.set(`my-orders-${userInfo}`, JSON.stringify(orders));
  }

  return res.status(200).json({
    success: true,
    orders,
  });
});
export const allOrders = TryCatch(async (req, res, next) => {
  let orders;
  if (myCache.has("all-orders")) {
    orders = JSON.parse(myCache.get("all-orders") as string);
  } else {
    orders = await Order.find().populate("userInfo", "name");
    if (!orders) return next(new ErrorHandler("No Order found", 404));
    myCache.set("all-orders", JSON.stringify(orders));
  }
  return res.status(200).json({
    success: true,
    orders,
  });
});
export const getSingleOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const key = `order-${id}`;
  let order;
  if (myCache.has(key)) {
    order = JSON.parse(myCache.get(key) as string);
  } else {
    order = await Order.findById(id).populate("userInfo", "name");
    if (!order) return next(new ErrorHandler("No Order found", 404));
    myCache.set(key, JSON.stringify(order));
  }
  return res.status(200).json({
    success: true,
    order,
  });
});
export const processOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const order = await Order.findById(id);
  if (!order) return next(new ErrorHandler("No Order found", 404));
  switch (order.status) {
    case "Processing":
      order.status = "Shipped";
      break;
    case "Shipped":
      order.status = "Delivered";
      break;
    default:
      order.status = "Delivered";
      break;
  }
  await cacheRevalidation({
    products: false,
    order: true,
    admins: true,
    userId: order.userInfo,
    orderId: String(order._id),
  });
  await order.save();
  return res.status(200).json({
    success: true,
    message: `Order${order.status}  successfully`,
    order,
  });
});
export const deleteOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const order = await Order.findById(id);
  if (!order) return next(new ErrorHandler("No Order found", 404));
  await order.deleteOne();
  await cacheRevalidation({
    products: false,
    order: true,
    admins: true,
    userId: order.userInfo,
    orderId: String(order._id),
  });
  return res.status(200).json({
    success: true,
    message: `Order deleted successfully`,
    order,
  });
});
