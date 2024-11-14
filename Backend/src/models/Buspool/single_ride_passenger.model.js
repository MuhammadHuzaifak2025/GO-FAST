import sequelize from "../../database/index.js";
import { DataTypes } from "sequelize";
import Bus from "./Bus.model.js";

const SingleRidePassenger = sequelize.define(
    "SingleRidePassenger", {
    single_ride_passenger_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bus_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Bus,
            key: "bus_id"
        },
        allowNull: false
    },
    Date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    is_paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

export default SingleRidePassenger;

// CREATE TABLE SingleRidePassenger (
//     single_ride_passenger_id INT PRIMARY KEY AUTO_INCREMENT,
//     bus_id INT NOT NULL,
//     Date DATE NOT NULL,
//     location VARCHAR(255) NOT NULL,
//     is_paid BOOLEAN DEFAULT FALSE,
//     FOREIGN KEY (bus_id) REFERENCES Bus(bus_id)
// );
