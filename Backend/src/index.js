import dotenv from "dotenv";
dotenv.config();
import express from "express";
import sequelize, { verifyConnection } from "./database/index.js";
import app from "./app.js";
import syncModels from "./models/Association.js";

import server from "./websockets/index.js";
import User from "./models/user.models.js";

verifyConnection()
    .then(() => {
        server.listen(process.env.PORT, () => {
            console.log("Listening on port", process.env.PORT);
        });

        syncModels();
        
    })
    .catch((err) => {
        console.error("Unable to connect to the database:", err);
    });

export { server };