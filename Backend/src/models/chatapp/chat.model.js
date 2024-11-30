import sequelize from "../../database/index.js"
import { DataTypes, ENUM } from "sequelize";
import ride_request from "../carpool/ride_request.models.js";

const Chat = sequelize.define('Chat', {
    chat_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ride_request,
            key: 'request_id'
        },
        onDelete: 'CASCADE',
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

export default Chat;