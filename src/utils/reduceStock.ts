import { Product } from "../models/products";
import { OrderItemType } from "../types/types";
import ErrorHandler from "./errorHandler";

const reduceStock = async (orderItems: OrderItemType[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const product = await Product.findById(orderItems[i].productId);
    if (!product) return new ErrorHandler("Product not found", 404);
    product.stock -= orderItems[i].quantity;
    await product.save();
  }
};

export default reduceStock;
