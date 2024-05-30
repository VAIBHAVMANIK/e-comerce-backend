import express from "express";
import { deleteUser, getAllUser, getUser, newUser } from "../controller/user";
import { adminAuth } from "../middleware/auth";

const app = express.Router();

// route -->/api/v1/user

// route -->/api/v1/user/new
app.post("/new", newUser);

// route -->/api/v1/user/all
app.get("/all", adminAuth, getAllUser);

//Dynamic route -->/api/v1/user/:id
app.route("/:id").get(getUser).delete(adminAuth, deleteUser);

export default app;
