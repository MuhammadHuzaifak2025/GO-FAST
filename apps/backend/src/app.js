import express from "express";
import cookieparser from "cookie-parser";
import cors from "cors";
import {
  ErrorHandlerMiddleWare,
  ServerErrorMiddleWare,
} from "./middlewares/globalerror.js";

const app = express();

app.use(
  cors({
    origin: '*',
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
