import express from "express";
import { connectDB } from "./data/dbconnection";
import { errorMiddleware } from "./middleware/error";
import userRoute from "./routes/user";
import productRoute from "./routes/product";
import orderRoute from "./routes/order";
import NodeCache from "node-cache";
import morgan from "morgan";

const app = express();
const port = process.env.PORT || "";
export const myCache = new NodeCache();
connectDB(process.env.MONGODB_URI || "");
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json("E-commerce backend is on the way");
});

//User routes
app.use("/api/v1/user", userRoute);
//Product routes
app.use("/api/v1/product", productRoute);
//Order routes
app.use("/api/v1/order", orderRoute);

//error Handler
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
