import sequelize from "../../database/index.js";
import { DataTypes } from "sequelize";
import Transport_Organization from "../Transport_Organization/index.model.js";

const Bus = sequelize.define(
    'bus', {
    bus_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bus_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    seats: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_seats: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    bus_organization: {
        type: DataTypes.INTEGER,
        references: {
            model: Transport_Organization,
            key: "organization_id"
        },
        allowNull: true
    },
    single_ride_fair: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}
);

export default Bus;

// CREATE TABLE Bus (
//     bus_id INT PRIMARY KEY AUTO_INCREMENT,
//     bus_number VARCHAR(255) NOT NULL,
//     seats INT NOT NULL,
//     bus_organization INT NOT NULL,
//     single_ride_fair FLOAT NOT NULL,
//     FOREIGN KEY (bus_organization) REFERENCES Transport_Organization(organization_id)
// );
