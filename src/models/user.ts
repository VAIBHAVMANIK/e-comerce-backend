import mongoose from "mongoose";
import validator from "validator";

interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  photo: string;
  role: "admin" | "user";
  gender: "male" | "female";
  dob: Date;
  createdAt: Date;
  updatedAt: Date;

  //Virtual Attributes
  age: number;
}

const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: [true, "Please enter Id"],
    },
    name: {
      type: String,
      required: [true, "Please enter name"],
    },
    email: {
      type: String,
      unique: [true, "email already exists"],
      required: [true, "Please enter email"],
      validator: validator.default.isEmail,
    },
    photo: {
      type: String,
      required: [true, "Please enter photo"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Please enter gender"],
    },
    dob: {
      type: Date,
      required: [true, "Please enter date of birth"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

schema.virtual("age").get(function () {
  const today = new Date();
  const dob = this.dob;
  let age = today.getFullYear() - dob.getFullYear();

  if (
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() == dob.getMonth() && today.getDate() < dob.getDate())
  )
    age--;
  return age;
});

export const User = mongoose.model<IUser>("User", schema);
