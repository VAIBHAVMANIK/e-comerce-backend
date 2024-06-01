import express from "express";
import {
  allOrders,
  deleteOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  processOrder,
} from "../controller/order";
import { adminAuth } from "../middleware/auth";

const app = express.Router();

// route -->/api/v1/order

// route -->/api/v1/order/new
app.post("/new", newOrder);
// route -->/api/v1/order/my
app.get("/my", myOrders);
// route -->/api/v1/order/all
app.get("/all", adminAuth, allOrders);

//Dynamic routes /api/v1/order/
app
  .route("/:id")
  .get(getSingleOrder)
  .put(adminAuth, processOrder)
  .delete(adminAuth, deleteOrder);

export default app;
