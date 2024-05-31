import express from "express";
import { connectDB } from "./data/dbconnection";
import { errorMiddleware } from "./middleware/error";
import userRoute from "./routes/user";
import productRoute from "./routes/product";
import NodeCache from "node-cache";

const app = express();
const port = 3000;
export const myCache = new NodeCache();
connectDB();
app.use(express.json());
app.use("/uploads",express.static("uploads"));

app.get("/", (req, res) => {
  res.json("E-commerce backend is on the way");
});

//User routes
app.use("/api/v1/user", userRoute);
//Product routes
app.use("/api/v1/product", productRoute);

//error Handler
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
