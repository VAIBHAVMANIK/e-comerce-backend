import { myCache } from "../app";
import { Product } from "../models/products";
import { cacheRevalidationProps } from "../types/types";

const cacheRevalidation = async ({
  products,
  order,
  admins,
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
  }
  if (admins) {
  }
};

export default cacheRevalidation;
