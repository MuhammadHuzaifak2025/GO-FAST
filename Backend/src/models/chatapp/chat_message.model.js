import sequelize from "../../database/index.js"
import { DataTypes, ENUM } from "sequelize";
import Chat from "./chat.model.js";
import User from "../user.models.js";

const ChatMessage = sequelize.define('ChatMessage', {
    chat_message_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    chat_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Chat,
            key: "chat_id"
        },
        allowNull: false
    },
    sender: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'user_id'
        },
        allowNull: false
    },
    receiver: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'user_id'
        },
        allowNull: false
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

export default ChatMessage;