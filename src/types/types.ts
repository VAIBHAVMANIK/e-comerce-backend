import { NextFunction, Request, Response } from "express";

export interface NewUserRequestBody {
  name: string;
  email: string;
  photo: string;
  gender: string;
  _id: string;
  dob: Date;
}
export interface UserId{
    id:string;
}

export interface ControllerType {
  (
    req: Request<UserId, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void | Response<any, Record<string, any>>>;
}
