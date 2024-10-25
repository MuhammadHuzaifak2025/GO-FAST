import express from "express";
import cookieparser from "cookie-parser";
import cors from "cors";
import {
  ErrorHandlerMiddleWare,
  ServerErrorMiddleWare,
} from "./middlewares/globalerror.js";

const app = express();
const allowedOrigins = ['http://192.168.10.3:8081', 'http://localhost:8081', 'exp://192.168.10.3:8081'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "50kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "50kb",
  })
);

app.use(express.static("public"));


import UserRouter from "./routes/user.routes.js";
app.use(cookieparser());

app.use("/gofast/api", UserRouter);


app.use(ErrorHandlerMiddleWare);

export default app;
