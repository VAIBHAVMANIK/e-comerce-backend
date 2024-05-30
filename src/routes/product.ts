import express from "express";
import { deleteUser, getAllUser, getUser, newUser } from "../controller/user";
import { adminAuth } from "../middleware/auth";

const app = express.Router();

// route -->/api/v1/product

// route -->/api/v1/product/new
app.post("/new", newUser);



export default app;
