import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler";

export const errorMiddleware = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
    err.message||= "Internal error";
    err.statusCode||= 500;

    return res.status(err.statusCode).json(
        {
            success:false,
            error:err.message,
        }
    );
};
