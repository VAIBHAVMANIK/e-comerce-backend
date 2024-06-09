import mongoose from "mongoose";
import { OrderItemType, ShippingAddress } from "../types/types";

interface IOrder extends Document {
  shippingAddress: ShippingAddress;
  userInfo: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  orderItems: OrderItemType;
}

const schema = new mongoose.Schema(
  {
    shippingAddress: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: Number,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    userInfo: {
      type: String,
      ref: "User",
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    shippingCharges: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered"],
      default: "Processing",
    },
    orderItems: [
      {
        name: String,
        price: Number,
        quantity: Number,
        photo: String,
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", schema);
