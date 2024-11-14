import sequelize from "../../database/index.js";
import { DataTypes } from "sequelize";

const Semester = sequelize.define(
    'semester', {
    semester_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    semester_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type_semester: {
        type: DataTypes.ENUM('Fall', 'Spring', 'Summer'),
        allowNull: false
    }
}
);

export default Semester;

// CREATE TABLE Semester (
//     semester_id INT PRIMARY KEY AUTO_INCREMENT,
//     semester_name VARCHAR(255) NOT NULL,
//     year INT NOT NULL,
//     type_semester ENUM('Fall', 'Spring', 'Summer') NOT NULL
// );
