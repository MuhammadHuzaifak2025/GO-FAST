import sequelize from "../../database/index.js";
import { DataTypes, ENUM } from "sequelize";
import CarpoolRide from "./carpool_ride.models.js";
import User from "../user.models.js";

const ride_passenger = sequelize.define(
    'ride_passenger', {
    passenger_ride_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ride_id: {
        type: DataTypes.INTEGER,
        references: {
            model: CarpoolRide,
            key: "ride_id"
        },
    },
    passenger_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: "user_id"
        },
        allowNull: false
    },

});

export default ride_passenger;