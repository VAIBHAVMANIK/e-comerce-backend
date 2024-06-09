import { myCache } from "../app";
import { cacheRevalidationProps } from "../types/types";

const cacheRevalidation = async ({
  products,
  order,
  admins,
  userId,
  productId,
  orderId,
}: cacheRevalidationProps) => {
  if (products) {
    const productsKey: string[] = [
      "all-products",
      "categories",
      "latest-product",
    ];
    if (typeof productId === "string") {
      productsKey.push(`product-${productId}`);
    }
    if (typeof productId === "object") {
      productId.forEach((i) => productsKey.push(`product-Ō${i}`));
    }

    myCache.del(productsKey);
  }
  if (order) {
    const orderKey: string[] = [
      "all-orders",
      `myOrder-${userId}`,
      `order=${orderId}`,
    ];

    myCache.del(orderKey);
  }
  if (admins) {
    const adminkeys = ["admin-dashboard","admin-product-chart","admin-barchart","admin-linechart"]
    myCache.del(adminkeys)
  }
};

export default cacheRevalidation;
