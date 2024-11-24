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
            `SELECT * FROM transport_organizations WHERE owner =?`,
            { replacements: [organization], type: QueryTypes.SELECT }
        );
        if (!getuserorganization) {
            return next(new ApiError(400, "You are not an Admin or Organization not found"));
        }
        const [getcurrentsemester] = await sequelize.query(
            `SELECT * FROM semesters order by semester_id desc limit 1`,
            { replacements: [start_date, start_date], type: QueryTypes.SELECT }
        );
        console.log(getcurrentsemester)
        const [checkifalreadyregistered] = await sequelize.query(
            `SELECT * FROM busregistrations order by registration_id desc limit 1`,
            { replacements: [getuserorganization.organization_id, start_date, due_date], type: QueryTypes.SELECT }
        );
        if (!checkifalreadyregistered) {
            const [createbusregistration] = await sequelize.query(
                `INSERT INTO busregistrations (organization, start_date, due_date, "createdAt", "updatedAt", "semester_id") VALUES (?,?,?,?,?,?) Returning *`,
                { replacements: [getuserorganization.organization_id, start_date, due_date, new Date(), new Date(), getcurrentsemester.semester_id], type: QueryTypes.INSERT }
            );
            console.log(createbusregistration, "hello")
            res.json(new ApiResponse(200, [createbusregistration[0], "Bus Registration Created Successfully"]))
        }
        if (checkifalreadyregistered.semester_id !== getcurrentsemester.semester_id) {
            console.log("semester", getcurrentsemester, checkifalreadyregistered)
            const [createbusregistration] = await sequelize.query(
                `INSERT INTO busregistrations (organization, start_date, due_date, "createdAt", "updatedAt", "semester_id") VALUES (?,?,?,?,?,?) Returning *`,
                { replacements: [getuserorganization.organization_id, start_date, due_date, new Date(), new Date(), getcurrentsemester.semester_id], type: QueryTypes.INSERT }
            );
            console.log(createbusregistration, "hello")
            res.json(new ApiResponse(200, [createbusregistration[0], "Bus Registration Created Successfully"]))

        }
        else {

            return next(new ApiError(400, "Bus Registration already exists"));
        }

        // const [getcurrentsemester] = await sequelize.query(
        //     `SELECT * FROM semesters order by semester_id desc limit 1`,
        //     { replacements: [start_date, start_date], type: QueryTypes.SELECT }
        // );
        // if (!getcurrentsemester) {
        //     return next(new ApiError(400, "No Semester Found"));
        // }

    } catch (error) {
        next(error)
    }
});

const getbusregistration = asynchandler(async (req, res, next) => {
    try {
        const organization = req.user.user_id;
        const [getuserorganization] = await sequelize.query(
            `SELECT * FROM transport_organizations WHERE owner =?`,
            { replacements: [organization], type: QueryTypes.SELECT }
        );

        const [getbusregistration] = await sequelize.query(
            `SELECT * FROM busregistrations WHERE organization =? order by registration_id desc limit 1`,
            { replacements: [getuserorganization.organization_id], type: QueryTypes.SELECT }
        );
        let semester;
        if (getbusregistration) {
            semester = await sequelize.query(`SELECT * FROM semesters order by 
                semester_id desc LIMIT 1`,
                { type: sequelize.QueryTypes.SELECT });


            if (getbusregistration.semester_id != semester[0].semester_id) {
                return next(new ApiError(400, "No Open Registration"));
            }
            console.log("semester", semester)
            getbusregistration.semester_id = semester
            res.json(new ApiResponse(200, getbusregistration));
        } else {
            res.status(400).json("No Data Found");
        }
        // return ApiResponse(res, 200, getbusregistration);
    } catch (error) {
        next(error)
    }
});

const showstudentregistration = asynchandler(async (req, res, next) => {
    try {
        const [getallregistration] = await sequelize.query(
            `SELECT * FROM busregistrations where due_date > ?`,
            { replacements: [Date.now], type: QueryTypes.SELECT }
        );
        if (!getallregistration) {
            return next(new ApiError(400, "No Bus Registration Found"));
        }
        // return ApiResponse(res, 200, getallregistration);
        res.json(new ApiResponse(200, getallregistration));
    } catch (error) {
        next(error);
    }
});

const get_student_registrations = asynchandler(async (req, res, next) => {
    try {
        const [getuserorganization] = await sequelize.query(
            `SELECT * FROM transport_organizations WHERE owner =?`,
            { replacements: [req.user.user_id], type: QueryTypes.SELECT }
        );
        const getallregistration = await sequelize.query(
            `SELECT distinct a.* FROM semester_passengers a inner join buses b on a.bus_id = b.bus_id
             inner join busregistrations c on b.bus_organization = c.organization
             where b.bus_organization = ? `,

            { replacements: [getuserorganization.organization_id,], type: QueryTypes.SELECT }
        );
        console.log(getallregistration)
        for (const i in getallregistration) {
            const user = await sequelize.query(
                `SELECT * FROM users where user_id = ?`,
                { replacements: [getallregistration[i].passenger_id], type: QueryTypes.SELECT }
            );
            getallregistration[i].passenger_id = user[0].username;
        }

        if (!getallregistration) {
            return next(new ApiError(400, "No Bus Registration Found"));
        }
        console.log(getallregistration)
        // return ApiResponse(res, 200, getallregistration);
        res.json(new ApiResponse(200, getallregistration));
    } catch (error) {
        next(error);
    }
});

const updateduedate = asynchandler(async (req, res, next) => {
    try {
        const { due_date, registration_id } = req.body;
        const [updatedate] = await sequelize.query(
            `UPDATE busregistrations SET due_date =? WHERE registration_id =? Returning *`,
            { replacements: [due_date, registration_id], type: QueryTypes.UPDATE }
        );
        res.json(new ApiResponse(200, [updatedate[0], "Due Date Updated Successfully"]));
    } catch (error) {
        next(error);
    }
});


const get_openreg_busses_with_routes = asynchandler(async (req, res, next) => {
    try {
        const semester = await sequelize.query(`SELECT * FROM semesters order by
        semester_id desc limit 1`,
            { type: QueryTypes.SELECT });
        // console.log(semester)
        if (!semester[0]) {
            return next(new ApiError(400, "No Semester Found"));
        }
        const getallregistration = await sequelize.query(
            `SELECT * FROM busregistrations where due_date > ? and semester_id = ?`,
            { replacements: [new Date(), semester[0].semester_id], type: QueryTypes.SELECT }
        );
        if (!getallregistration) {
            return next(new ApiError(400, "No Bus Registration Found"));
        }
        for (const i in getallregistration) {
            getallregistration[i].semester = semester[0]
            const bus = await sequelize.query(
                `SELECT * FROM buses where bus_organization = ?`,
                { replacements: [getallregistration[i].organization], type: QueryTypes.SELECT }
            );
            console.log("bus", bus)
            if (!bus) {
                break;
            }
            getallregistration[i].bus = bus;
            for (const j in bus) {
                const getbusroutes = await sequelize.query(
                    `SELECT * FROM busroutes a inner join routes b on a.route_id = b.route_id where bus_id = ?`,
                    { replacements: [bus[j].bus_id], type: QueryTypes.SELECT }
                );
                bus[j].routes = getbusroutes;
            }
        }
        res.json(new ApiResponse(200, getallregistration));
    } catch (error) {
        next(error);
    }
});

const get_busPassenger_ifregistered = asynchandler(async (req, res, next) => {
    try {
        const passenger_id = req.user.user_id;
        const [semester_id] = await sequelize.query(`SELECT * FROM semesters order by semester_id desc limit 1`,
            { type: QueryTypes.SELECT });
        console.log(semester_id)
        if (!semester_id) {
            return next(new ApiError(400, "No Semester Found"));
        }
        const [getPassenger] = await sequelize.query(`SELECT * FROM semester_passengers a inner join buses b on a.bus_id = b.bus_id WHERE semester_id = '
            ${semester_id.semester_id}' AND passenger_id = '${passenger_id}'`, { type: sequelize.QueryTypes.SELECT });
        if (getPassenger) {
            console.log(getPassenger)
            const pickup = await sequelize.query(`SELECT * FROM routes where route_id = '${getPassenger.pickup}'`,
                { type: QueryTypes.SELECT });
            getPassenger.pickup = pickup;
            const dropoff = await sequelize.query(`SELECT * FROM routes where route_id = '${getPassenger.dropoff}'`,
                { type: QueryTypes.SELECT });
            getPassenger.dropoff = dropoff;
            return res.status(200).json(new ApiResponse(200, getPassenger));
        }

        return next(new ApiError(400, "No Passenger Found"));

    } catch (error) {
        next(error);
    }
}
);



export { openbusregistration, get_busPassenger_ifregistered, get_openreg_busses_with_routes, getbusregistration, showstudentregistration, updateduedate, get_student_registrations };