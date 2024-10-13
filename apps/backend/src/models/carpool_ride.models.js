import sequelize from "../database/index.js";
import { DataTypes, ENUM } from "sequelize";
import User from "./user.models.js";

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
    vehicle_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "carpool_vehicle",
            key: "vehicle_id"
        },
        allowNull: false
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false
    },
    fare: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    ride_status: {
        type: ENUM,
        values: ['available', 'in_progress', 'completed', 'canceled'],
        allowNull: true,
    },
    passengers: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
        references: {
            model: User,
            key: "user_id"
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    }
});

export default CarpoolRide;


// CREATE TABLE carpool_ride (
//     ride_id SERIAL PRIMARY KEY,
//     routes VARCHAR(255) NOT NULL,
//     driver INTEGER NOT NULL,
//     vehicle_id INTEGER NOT NULL,
//     start_time TIMESTAMP NOT NULL,
//     fare FLOAT NOT NULL,
//     ride_status ENUM('available', 'in_progress', 'completed', 'canceled'),
    
//     -- Foreign key for driver (references user table)
//     CONSTRAINT fk_driver FOREIGN KEY (driver)
//         REFERENCES user(user_id)
//         ON UPDATE CASCADE
//         ON DELETE SET NULL,

//     -- Foreign key for vehicle_id (references carpool_vehicle table)
//     CONSTRAINT fk_vehicle FOREIGN KEY (vehicle_id)
//         REFERENCES carpool_vehicle(vehicle_id)
//         ON UPDATE CASCADE
//         ON DELETE SET NULL
// );
