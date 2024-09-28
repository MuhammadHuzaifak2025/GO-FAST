import sequelize from "../database/index.js"
import { DataTypes } from "sequelize"
import bcrypt from "bcrypt"

const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);

const User = sequelize.define("user", {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    refresh_token: {
        type: DataTypes.STRING
    },
    phone: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    address: {
        type: DataTypes.STRING
    },
    license: {
        type: DataTypes.STRING
    },
    forgetpassword: {
        type: DataTypes.BOOLEAN,
    },
    admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
},
    {
        hooks: {
            beforeSave: async (user, options) => {
                if (user.changed("password")) {
                    user.password = await bcrypt.hash(user.password, saltRounds);
                }
            },
            beforeUpdate: async (user, options) => {
                if (user.changed("password")) {
                    console.log(user.password);
                    user.password = await bcrypt.hash(user.password, saltRounds);
                    console.log(user.password);
                }
            },
        },
    });

export default User;

// Querry Alternative

// sequelize.query(`
//     CREATE TABLE user (
//         user_id SERIAL PRIMARY KEY,
//         username VARCHAR(255) NOT NULL,
//         password VARCHAR(255) NOT NULL,
//         refresh_token VARCHAR(255),
//         phone VARCHAR(255),
//         email VARCHAR(255),
//         address VARCHAR(255),
//         license VARCHAR(255),
//         admin BOOLEAN DEFAULT FALSE,
//         forgetpassword BOOLEAN
//     )
// `)
