import dotenv from "dotenv";
dotenv.config();
import express from "express";
import sequelize, { verifyConnection } from "./database/index.js";
import app from "./app.js";
import syncModels from "./models/Association.js";



verifyConnection()
    .then(() => {
        app.listen(process.env.PORT, process.env.IP, () => {
            console.log("Listening on port", process.env.PORT);
        });

        syncModels();
    })
    .catch((err) => {
        console.error("Unable to connect to the database:", err);
    });