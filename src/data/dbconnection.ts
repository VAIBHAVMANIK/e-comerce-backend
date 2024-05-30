import mongoose from "mongoose";

export const connectDB = ()=> mongoose.connect("mongodb://localhost:27017/", {
  dbName: "e-commerce",
}).then((data) => {
    console.log(`Database connected ${data.connection.host}`);
}).catch(() => {
    console.log("Database connection failed");
});
