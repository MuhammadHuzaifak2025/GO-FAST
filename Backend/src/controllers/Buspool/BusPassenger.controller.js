import sequelize from "../../database/index.js";
import asynchandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ErrorHandling.js";
import ApiResponse from "../../utils/ResponseHandling.js";

const create_Semester = asynchandler(async (req, res, next) => {
    try {
        const { Year, Type } = req.body;
        if (!Year || !Type) {
            return next(ApiError.badRequest("Please provide all required fields"));
        }
        if (Type !== 'Fall' && Type !== 'Spring' && Type !== 'Summer') {
            return next(new ApiError("Please provide valid semester type"));
        }
        const [getSemester] = await sequelize.query(`SELECT * FROM semesters WHERE Year = '${Year}' AND Type = '${Type}'`,
            { type: sequelize.QueryTypes.SELECT }
        );
        if (getSemester.length > 0) {
            return next(ApiError.badRequest("Semester already exists"));
        }
        const semester = await sequelize.query(`INSERT INTO semesters (Year, Type) VALUES ('${Year}', '${Type}')`,
            { type: sequelize.QueryTypes.INSERT }   
        );
        if (semester) {
            return res.status(201).json(new ApiResponse(201, "Semester created successfully"));
        }
    } catch (error) {
        next(error);
    }
});

const get_Semesters = asynchandler(async (req, res, next) => {
    try {
        const semesters = await sequelize.query(`SELECT * FROM semesters`, { type: sequelize.QueryTypes.SELECT });
        if (semesters) {
            return res.status(200).json(new ApiResponse(200, semesters[0]));
        }
        else {
            return next(new ApiError("No semesters found"));
        }
    } catch (error) {
        next(error);
    }
});

const register_Semester_Passenger = asynchandler(async (req, res, next) => {
    try {
        const { semester_id, passenger_id, pickup, dropoff, bus_id } = req.body;
        if (!semester_id || !passenger_id || !pickup || !dropoff || !bus_id) {
            return next(new ApiError("Please provide all required fields"));
        }
        const [getPassenger] = await sequelize.query(`SELECT * FROM semester_passengers  WHERE semester_id = '
            ${semester_id}' AND passenger_id = '${passenger_id}'`, { type: sequelize.QueryTypes.SELECT });
        if (getPassenger.length > 0) {
            return next(new ApiError("Passenger already registered for this semester"));
        }
        const [getBus] = await sequelize.query(`SELECT * FROM buses WHERE bus_id = '${bus_id}'`, { type: sequelize.QueryTypes.SELECT });
        if (getBus.seats <= 0) {
            return next(new ApiError("Bus is full"));
        }
        const passenger = await sequelize.query(`INSERT INTO semester_passengers 
            (semester_id, passenger_id, pickup, dropoff, bus_id, amount) 
            VALUES ('${semester_id}', '${passenger_id}', '${pickup}', '${dropoff}', '${bus_id}, 46000')
             Returning *`, { type: sequelize.QueryTypes.INSERT });
        const update_Bus = await sequelize.query(`UPDATE buses SET seats = seats - 1 WHERE bus_id = 
            '${bus_id}' returning *`, { type: sequelize.QueryTypes.UPDATE });
        if (passenger && update_Bus) {

            return res.status(201).json(new ApiResponse(201, "Passenger registered successfully"));
        }
    } catch (error) {
        next(error);
    }
});

const get_Semester_Passengers = asynchandler(async (req, res, next) => {
    try {
        const { bus_id } = req.params;
        let passengers;
        if (!bus_id) {
            passengers = await sequelize.query(`SELECT * FROM semester_passengers`);
        }
        else
            passengers = await sequelize.query(`SELECT * FROM semester_passengers where 
        bus_id = '${bus_id}'`, { type: sequelize.QueryTypes.SELECT });
        if (passengers[0]) {
            return res.status(200).json(new ApiResponse(200, passengers[0]));
        }
        else {
            return next(new ApiError("No passengers found"));
        }
    } catch (error) {
        next(error);
    }
});

const getBill = asynchandler(async (req, res, next) => {
    try {
        const { semester_passenger_id } = req.params;
        const [getPassenger] = await sequelize.query(`SELECT * FROM semester_passengers
             WHERE semester_passenger_id = '${semester_passenger_id}'`, { type: sequelize.QueryTypes.SELECT });
        if (getPassenger.length === 0) {
            return next(new ApiError("Passenger not found"));
        }
        if (getPassenger[0].is_paid) {
            return next(new ApiError("Bill already paid"));
        }
        return res.status(200).json(new ApiResponse(200, getPassenger[0]));
    } catch (error) {
        next(error);
    }
});

const pay_Semester_Passenger = asynchandler(async (req, res, next) => {
    try {
        const { semester_passenger_id } = req.params;
        const [getPassenger] = await sequelize.query(`SELECT * FROM semester_passengers WHERE
             semester_passenger_id = '${semester_passenger_id}'`, { type: sequelize.QueryTypes.SELECT });
        if (getPassenger.length === 0) {
            return next(new ApiError("Passenger not found"));
        }
        const pay = await sequelize.query(`UPDATE semester_passengers 
            SET (is_paid, amount) Values (true, 0)  WHERE
             semester_passenger_id = '${semester_passenger_id}' returning *`, { type: sequelize.QueryTypes.UPDATE });
        if (pay) {
            return res.status(200).json(new ApiResponse(200, "Payment successful"));
        }
    } catch (error) {
        next(error);
    }
});

const getDetails = asynchandler(async (req, res, next) => {
    try {
        const user_id = req.user.user_id;
        const [getDetails] = await sequelize.query(`SELECT * FROM semester_passengers 
            WHERE passenger_id = '${user_id}'`, { type: sequelize.QueryTypes.SELECT });
        if (getDetails.length === 0) {
            return next(new ApiError("No details found"));
        }
        return res.status(200).json(new ApiResponse(200, getDetails[0]));

    } catch (error) {
        next(error);
    }
});

export { create_Semester, get_Semesters, register_Semester_Passenger, get_Semester_Passengers, getBill, pay_Semester_Passenger };