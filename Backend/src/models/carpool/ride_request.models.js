import sequelize from "../../database/index.js";
import { DataTypes, ENUM } from "sequelize";
import CarpoolRide from "./carpool_ride.models.js";
import User from "../user.models.js";

const ride_request = sequelize.define(
    'ride_request', {
    request_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ride_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: CarpoolRide,
            key: 'ride_id'
        }
    },
    requesting_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    is_approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    owner_socket_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    requesting_user_socket_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    seats_requested: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

export default ride_request;