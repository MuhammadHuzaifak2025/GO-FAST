import sequelize from "../../../src/database/index.js"
import { DataTypes } from "sequelize"
import User from "../user.models.js";

const Transport_Organization = sequelize.define(
    'transport_organization', {
    organization_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    organization_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    organization_email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    bank_account_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    owner: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: "user_id"
        }
    }

}
);

export default Transport_Organization;

// CREATE TABLE Transport_Organization (
//     organization_id INT PRIMARY KEY AUTO_INCREMENT,
//     organization_name VARCHAR(255) NOT NULL,
//     organization_email VARCHAR(255) NOT NULL,
//     bank_account_no VARCHAR(255) NOT NULL,
//     owner INT,
//     FOREIGN KEY (owner) REFERENCES User(user_id)
// );
