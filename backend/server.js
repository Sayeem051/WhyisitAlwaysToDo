import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { TaskRouter } from "./crud.js";

dotenv.config();

const app = express();

app.use(express.json(), (error, req, res, next) => {
  if (error) {
    return res.status(400).json({
      code: 400,
      status: "failed",
      msg: "Invalid JSON body",
    });
  }
  next();
});
app.use(morgan("dev"));

// cors policy described here so it applies to all the routes that come after it
app.use(cors());

app.use("/task", TaskRouter);
app.use("/", (req, res, next) => {
  return res.status(200).json({
    code: 200,
    status: "Success",
    msg: "Server is working",
  });
});

app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT;
app.listen(port, () => {
  console.log("Server is running on port " + port);
});
