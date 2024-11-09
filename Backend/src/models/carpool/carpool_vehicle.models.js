import sequelize from "../../database/index.js";
import User from "../user.models.js";
import { DataTypes } from "sequelize";

const carpool_vehicle = sequelize.define(
    'carpool_vehicle',
    {
        vehicle_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        owner: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "user_id",
            },
        },
        type_of_vehicle: {
            type: DataTypes.ENUM,
            values: ['Car', 'Bike',],
        },
        seats: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        registration_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false
        },
        make: {
            type: DataTypes.STRING,
            allowNull: false
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false
        },
    }
)

export default carpool_vehicle;


// CREATE TABLE carpool_vehicle (
//     vehicle_id INT PRIMARY KEY AUTO_INCREMENT,
//     owner INT NOT NULL,
//     type_of_car ENUM('Car', 'Bike'),
//     seats INT NOT NULL,
//     registration_number VARCHAR(255) NOT NULL,
//     model VARCHAR(255) NOT NULL,
//     make VARCHAR(255) NOT NULL,
//     color VARCHAR(255) NOT NULL,
//     FOREIGN KEY (owner) REFERENCES users(user_id)
// );
