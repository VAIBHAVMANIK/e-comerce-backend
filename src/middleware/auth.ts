import { User } from "../models/user";
import ErrorHandler from "../utils/errorHandler";
import { TryCatch } from "./tryCatch";

export const adminAuth = TryCatch(async (req, res, next) => {
  const { id } = req.query;
  if (!id) return next(new ErrorHandler("Login First", 404));

  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  if (user.role !== "admin") return next(new ErrorHandler("Unauthorized", 401));

  next();
});
