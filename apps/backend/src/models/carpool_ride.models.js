import sequelize from "../database/index.js";
import { DataTypes } from "sequelize";

const CarpoolRide = sequelize.define(
    "carpool_ride", {
    ride_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    routes: {
        type: DataTypes.STRING,
        allowNull: false
    },
    driver: {
        type: DataTypes.INTEGER,
        references: {
            model: "user",
            key: "user_id"
        },
        allowNull: false
    },
    vehicle_id:{
        type: DataTypes.INTEGER,
        references: {
            model: "carpool_vehicle",
            key: "vehicle_id"
        },
        allowNull: false
    },
    
});