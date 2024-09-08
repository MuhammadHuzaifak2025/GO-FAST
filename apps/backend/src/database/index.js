import { Sequelize } from "sequelize";
import dotenv from "dotenv";



dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  pool: {
    max: 5,
    idle: 30000,
    acquire: 60000,
  },
});

const verifyConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default sequelize;
export { verifyConnection };
