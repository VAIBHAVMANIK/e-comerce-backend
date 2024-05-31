import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middleware/tryCatch";
import { User } from "../models/user";
import { NewUserRequestBody } from "../types/types";
import ErrorHandler from "../utils/errorHandler";

export const newUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { _id, dob, email, gender, name, photo } = req.body;

    let user = await User.findOne({ _id });

    if (user) {
      return res.status(200).json({
        success: true,
        message: `Welcome back ${user.name}`,
      });
    }

    if (!_id || !dob || !email || !gender || !name || !photo) {
      next(new ErrorHandler("Please enter all fields", 400));
    }

    user = await User.create({
      _id,
      dob,
      email,
      gender,
      name,
      photo,
    });

    return res.status(200).json({
      success: true,
      message: "User created successfully ",
    });
  }
);

export const getAllUser = TryCatch(async (req, res, next) => {
  const users = await User.find({});
  return res.status(200).json({
    success: true,
    users,
  });
});

export const getUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  return res.status(200).json({
    success: true,
    user,
  });
});
export const deleteUser = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  await user.deleteOne();

  return res.status(202).json({
    success: true,
    message: `User deleted successfully`,
  });
});
