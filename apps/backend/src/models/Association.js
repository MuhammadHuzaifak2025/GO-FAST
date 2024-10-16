import sequelize from "../database/index.js";
// import User from "../models/user.models.js";


const syncModels = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("Models synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing models:", error);
  }
};

export default syncModels;
