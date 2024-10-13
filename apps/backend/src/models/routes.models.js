import sequelize from "../database/index.js";

import { DataTypes, ENUM } from "sequelize";

const Route = sequelize.define(
    "route", {
    route_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    route_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    start_point: {
        type: DataTypes.STRING,
        allowNull: false
    },
    end_point: {
        type: DataTypes.STRING,
        allowNull: false
    },
    starting_latitude: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    starting_longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    ending_latitude: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    ending_longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

});
export default Route;



// CREATE TABLE route (
//     route_id SERIAL PRIMARY KEY,           -- Auto-incrementing primary key
//     route_name VARCHAR(255) NOT NULL,      -- Route name (string, cannot be null)
//     start_point VARCHAR(255) NOT NULL,     -- Starting point of the route
//     end_point VARCHAR(255) NOT NULL,       -- Ending point of the route
//     starting_latitude DOUBLE PRECISION NOT NULL, -- Latitude for the starting point
//     starting_longitude DOUBLE PRECISION NOT NULL, -- Longitude for the starting point
//     ending_latitude DOUBLE PRECISION NOT NULL,   -- Latitude for the ending point
//     ending_longitude DOUBLE PRECISION NOT NULL   -- Longitude for the ending point
// );
