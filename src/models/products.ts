import mongoose from "mongoose";

interface IProduct extends Document {
  name: string;
  photo: string;
  category: string;
  stock: number;
  price: number;
}

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter name"],
    },
    photo: {
      type: String,
      required: [true, "Please enter photo"],
    },
    stock: {
      type: Number,
      required: [true, "Please enter stock"],
    },
    price: {
      type: Number,
      required: [true, "Please enter price"],
    },
    category: {
      type: String,
      required: [true, "Please enter category"],
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model<IProduct>("Product", schema);
