import sequelize from "../../database/index.js";
import { DataTypes } from "sequelize";
import Bus from "./Bus.model.js";
import SingleRidePassenger from "./single_ride_passenger.model.js";

const BusSingleRide = sequelize.define(
    "bussingleride", {
    BusSemesterRide_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bus_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Bus,
            key: "bus_id"
        }
    },
    passenger_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: SingleRidePassenger,
            key: "single_ride_passenger_id"
        }
    }
});

export default BusSingleRide;

// CREATE TABLE BusSingleRide (
//     BusSemesterRide_id INT PRIMARY KEY AUTO_INCREMENT,
//     bus_id INT NOT NULL,
//     passenger_id INT NOT NULL,
//     FOREIGN KEY (bus_id) REFERENCES Bus(bus_id),
//     FOREIGN KEY (passenger_id) REFERENCES SingleRidePassenger(single_ride_passenger_id)
// );
