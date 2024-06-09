import { NextFunction, Request, Response } from "express";
import mongoose, { Document } from "mongoose";
// import { IProduct, Product } from "../models/products";
export interface NewUserRequestBody {
  name: string;
  email: string;
  photo: string;
  gender: string;
  _id: string;
  dob: Date;
}
export interface NewProductRequestBody {
  name: string;
  category: string;
  price: number;
  stock: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  pinpcode: number;
  country: string;
}

export interface OrderItemType {
  name: string;
  productId: string;
  quantity: number;
  price: number;
  photo: string;
}

export interface NewOrderRequestBody {
  shippingAddress: ShippingAddress;
  orderItems: OrderItemType[];
  subtotal: number;
  total: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  userInfo: string;
}

export interface ControllerType {
  (req: Request, res: Response, next: NextFunction): Promise<void | Response<
    any,
    Record<string, any>
  >>;
}

export type SearchRequestQuery = {
  search?: string;
  category?: string;
  price?: string;
  sort?: string;
  page?: string;
};

export interface BaseQuery {
  name?: {
    $regex: string;
    $options: string;
  };
  category?: string;
  price?: {
    $lte: number;
  };
}

export type cacheRevalidationProps = {
  products?: boolean;
  order?: boolean;
  admins?: boolean;
  userId?: string;
  orderId?: string;
  productId?: string | string[];
};

export type NewCouponRequestBody = {
  code: string;
  amount: number;
};

export interface MyDocument extends Document {
  createdAt: Date;
  property?: string;
  total?: number;
  discount?: number;
}
