import express from "express";
import cookieparser from "cookie-parser";
import cors from "cors";
import {
  ErrorHandlerMiddleWare,
  ServerErrorMiddleWare,
} from "./middlewares/GlobalError.js";

const app = express();
const allowedOrigins = [
  // https://disreputable-cauldron-p4xrx6j446gh94r7-8081.app.github.dev/
  'https://dkfmdoe-anonymous-8081.exp.direct',
  '192.168.10.6:5001',
  'https://disreputable-cauldron-p4xrx6j446gh94r7-8081.app.github.dev',
  'https://disreputable-cauldron-p4xrx6j446gh94r7-5432.app.github.dev',
  'https://disreputable-cauldron-p4xrx6j446gh94r7-5005.app.github.dev',
  'https://disreputable-cauldron-p4xrx6j446gh94r7-4040.app.github.dev',
  'https://disreputable-cauldron-p4xrx6j446gh94r7-5000.app.github.dev', // Add this line
];
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
// app.use(cors());
app.options('*', cors());

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
import Vehicle_Router from "./routes/carpool/vehicle.routes.js";
import RideRouter from "./routes/carpool/rides.routes.js";
import RideRequestRouter from "./routes/carpool/ride_request.routes.js";
import Trasport_Manager from "./routes/Transport_manager.routes.js";
import BusRouter from "./routes/buspool/bus.routes.js";
app.use(cookieparser());

app.use("/gofast/api", UserRouter);
app.use("/gofast/api", Vehicle_Router);
app.use("/gofast/api", RideRouter);
app.use('/gofast/api', RideRequestRouter);
app.use('/gofast/api', Trasport_Manager);
app.use('/gofast/api', BusRouter);

app.use(ErrorHandlerMiddleWare);

export default app;
