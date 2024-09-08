import dotenv from "dotenv";
dotenv.config();

import sequelize, { verifyConnection } from "./database/index.js";
import app from "./app.js";
// import syncModels from "./models/association.js";

verifyConnection()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Listening on port 8000");
    });

    // syncModels();
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
