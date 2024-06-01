import mongoose from "mongoose";


export const connectDB = (uri:string) =>
  mongoose
    .connect(uri, {
      dbName: "e-commerce",
    })
    .then((data) => {
      console.log(`Database connected ${data.connection.host}`);
    })
    .catch(() => {
      console.log("Database connection failed");
    });
