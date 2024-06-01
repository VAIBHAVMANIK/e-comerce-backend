import { myCache } from "../app";
import { Order } from "../models/order";
import { Product } from "../models/products";
import { cacheRevalidationProps } from "../types/types";

const cacheRevalidation = async ({
  products,
  order,
  admins,
  userId,
}: cacheRevalidationProps) => {
  if (products) {
    const productsKey: string[] = [
      "all-products",
      "categories",
      "latest-product",
    ];
    const products = await Product.find({}).select("_id");
    products.forEach((id) => {
      productsKey.push(`product=${id}`);
    });

    myCache.del(productsKey);
  }
  if (order) {
    const orderKey: string[] = ["all-orders", `myOrder-${userId}`];
    const order = await Order.find({}).select("_id");
    order.forEach((i) => {
      orderKey.push(`order=${i._id}`);
    });

    myCache.del(orderKey);
  }
  if (admins) {
  }
};

export default cacheRevalidation;
