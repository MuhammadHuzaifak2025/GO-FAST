import sequelize from "../../database/index.js";
import asynchandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ErrorHandling.js";
import ApiResponse from "../../utils/ResponseHandling.js";
import { QueryTypes } from "sequelize";

const openbusregistration = asynchandler(async (req, res, next) => {
    try {
        const { start_date, due_date, } = req.body;
        const organization = req.user.user_id;
        const [getuserorganization] = await sequelize.query(
            `SELECT * FROM transport_organization WHERE owner =?`,
            { replacements: [organization], type: QueryTypes.SELECT }
        );

        const [checkifalreadyregistered] = await sequelize.query(
            `SELECT * FROM busregistration WHERE organization =? and start_date =? and due_date =?`,
            { replacements: [getuserorganization.organization_id, start_date, due_date], type: QueryTypes.SELECT }
        );
        if (checkifalreadyregistered) {
            return next(new ApiError(400, "Bus Registration already exists"));
        }
        else {
            const [createbusregistration] = await sequelize.query(
                `INSERT INTO busregistration (organization, start_date, due_date) VALUES (?,?,?) Returning *`,
                { replacements: [getuserorganization.organization_id, start_date, due_date], type: QueryTypes.INSERT }
            );
            if (checkifalreadyregistered)
                return ApiResponse(res, 200, [createbusregistration[0], "Bus Registration Created Successfully"]);
        }

    } catch (error) {
        next(error)
    }
});

const getbusregistration = asynchandler(async (req, res, next) => {
    try {
        const organization = req.user.user_id;
        const [getuserorganization] = await sequelize.query(
            `SELECT * FROM transport_organization WHERE owner =?`,
            { replacements: [organization], type: QueryTypes.SELECT }
        );
        const [getbusregistration] = await sequelize.query(
            `SELECT * FROM busregistration WHERE organization =?`,
            { replacements: [getuserorganization.organization_id], type: QueryTypes.SELECT }
        );
        return ApiResponse(res, 200, getbusregistration);
    } catch (error) {
        next(error)
    }
});

const showstudentregistration = asynchandler(async (req, res, next) => {
    try {
        const [getallregistration] = await sequelize.query(
            `SELECT * FROM busregistration where due_date > ?`,
            { replacements: [Date.now], type: QueryTypes.SELECT }
        );
        if (!getallregistration) {
            return next(new ApiError(400, "No Bus Registration Found"));
        }
        return ApiResponse(res, 200, getallregistration);
    } catch (error) {
        next(error);
    }
});

const updateduedate = asynchandler(async (req, res, next) => {
    try {
        const { due_date, registration_id } = req.body;
        const [updatedate] = await sequelize.query(
            `UPDATE busregistration SET due_date =? WHERE registration_id =? Returning *`,
            { replacements: [due_date, registration_id], type: QueryTypes.UPDATE }
        );

    } catch (error) {
        next(error);
    }
});

export { openbusregistration, getbusregistration, showstudentregistration, updateduedate };