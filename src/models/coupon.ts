import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Please enter code"],
      unique: true,
    },
    amount: {
      type: Number,
      required: [true, "Please enter amount"],
    },
  },
  {
    timestamps: true,
  }
);

export const Coupon = mongoose.model("Coupon", schema);
