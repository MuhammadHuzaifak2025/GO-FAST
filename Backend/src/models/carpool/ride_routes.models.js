import sequelize from "../../database/index.js"
import { DataTypes, ENUM } from "sequelize";
import CarpoolRide from "./carpool_ride.models.js";
import Route from "./routes.models.js";

const ride_routes = sequelize.define(
    'ride_routes', {
    route_ride_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ride_id: {
        type: DataTypes.INTEGER,
        references: {
            model: CarpoolRide,
            key: "ride_id"
        }
    },
    route_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Route,
            key: "route_id"
        }
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

export default ride_routes;