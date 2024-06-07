import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";

export const errorMiddleware = (
  err: ErrorHandler | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.message ||= "Internal error";
  err.statusCode ||= 500;

  if (err.name === "CastError") {
    (err.message = "Invalid Id"), (err.statusCode = 400);
  }
  if (err.code === 11000) {
    (err.message = "Duplicate entry"), (err.statusCode = 400);
  }

  return res.status(err.statusCode).json({
    success: false,
    error: err.message,
  });
};
