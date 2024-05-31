import multer from "multer";
import ErrorHandler from "../utils/errorHandler";
import {v4 as uuid } from "uuid";

const storage = multer.diskStorage({
  destination:(req, file, callback)=> {
    callback(null, "uploads");
  },
  filename:(req, file, callback)=> {
    const id = uuid();
    callback(null, `${id}.${file.originalname.split(".").pop()}`);
  },
});

export const singleUplod = multer({ storage }).single("photo");
