import sequelize from "../../database/index.js";
import { DataTypes } from "sequelize";
import Bus from "./Bus.model.js";
import Route from "../carpool/routes.models.js";

const BusRoutes = sequelize.define(
    'busroutes', {
    BusRoutes_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    route_id: {
        type: DataTypes.INTEGER,
        // autoIncrement: true
        references: {
            model: Route,
            key: "route_id"
        }
    },
    bus_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Bus,
            key: "bus_id"
        }
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false
    }

}
);

export default BusRoutes;

// CREATE TABLE BusRoutes (
//     BusRoutes_id INT PRIMARY KEY AUTO_INCREMENT,
//     route_id INT,
//     bus_id INT NOT NULL,
//     FOREIGN KEY (route_id) REFERENCES Route(route_id),
//     FOREIGN KEY (bus_id) REFERENCES Bus(bus_id)
// );
