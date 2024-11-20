import sequelize from "../../database/index.js";
import { DataTypes } from "sequelize";
import Bus from "./Bus.model.js";
import Transport_Organization from "../Transport_Organization/index.model.js";

const busRegistration = sequelize.define(
    "busregistration", {
    registration_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    organization: {
        type: DataTypes.INTEGER,
        references: {
            model: Transport_Organization,
            key: "organization_id"
        },
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
});

export default busRegistration;