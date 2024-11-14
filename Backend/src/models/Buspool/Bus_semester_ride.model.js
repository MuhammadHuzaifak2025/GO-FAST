import sequelize from "../../database/index.js";
import { DataTypes } from "sequelize";
import Bus from "./Bus.model.js";
import semester_passenger from "./semester_passenger.model.js";

const BusSemesterRide = sequelize.define(
    "BusSemesterRide", {
    BusSemesterRide_id: {
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
    }
    ,
    passenger_id: {
        type: DataTypes.INTEGER,
        references: {
            model: semester_passenger,
            key: "semester_passenger_id"
        }
    }
});
export default BusSemesterRide;

// CREATE TABLE BusSemesterRide (
//     BusSemesterRide_id INT PRIMARY KEY AUTO_INCREMENT,
//     bus_id INT NOT NULL,
//     passenger_id INT,
//     FOREIGN KEY (bus_id) REFERENCES Bus(bus_id),
//     FOREIGN KEY (passenger_id) REFERENCES semester_passenger(semester_passenger_id)
// );
