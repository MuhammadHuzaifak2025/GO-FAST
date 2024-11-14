import sequelize from "../../database/index.js";
import { DataTypes } from "sequelize";
import User from "../user.models.js";
import Route from "../carpool/routes.models.js";
import Semester from "./semester.model.js";

const semester_passenger = sequelize.define(
    'semester_passenger', {
    semester_passenger_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    semester_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Semester,
            key: "semester_id"
        },
        allowNull: false
    },
    passenger_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'user_id'
        },
        allowNull: false
    },
    pickup: {
        type: DataTypes.INTEGER,
        references: {
            model: Route,
            key: 'route_id'
        }
    },
    dropoff: {
        type: DataTypes.INTEGER,
        references: {
            model: Route,
            key: 'route_id'
        }
    },
    is_paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});
export default semester_passenger;

// CREATE TABLE semester_passenger (
//     semester_passenger_id INT PRIMARY KEY AUTO_INCREMENT,
//     semester_id INT NOT NULL,
//     passenger_id INT NOT NULL,
//     pickup INT,
//     dropoff INT,
//     is_paid BOOLEAN DEFAULT FALSE,
//     FOREIGN KEY (semester_id) REFERENCES Semester(semester_id),
//     FOREIGN KEY (passenger_id) REFERENCES User(user_id),
//     FOREIGN KEY (pickup) REFERENCES Route(route_id),
//     FOREIGN KEY (dropoff) REFERENCES Route(route_id)
// );
