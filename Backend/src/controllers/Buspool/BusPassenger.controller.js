import sequelize from "../../database/index.js";
import asynchandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ErrorHandling.js";
import ApiResponse from "../../utils/ResponseHandling.js";

const create_Semester = asynchandler(async (req, res, next) => {
    try {
        const { Year, Type } = req.body;
        if (!Year || !Type) {
            return next(new ApiError(400, "Please provide all required fields"));
        }
        if (Type !== 'Fall' && Type !== 'Spring' && Type !== 'Summer') {
            return next(new ApiError("Please provide valid semester type"));
        }
        const [getSemester] = await sequelize.query(`SELECT * FROM semesters WHERE Year = '${Year}' AND type_semester = '${Type}'`,
            { type: sequelize.QueryTypes.SELECT }
        );
        if (getSemester) {
            return next(new ApiError(400, "Semester already exists"));
        }
        const semester = await sequelize.query(`INSERT INTO semesters (Year, type_semester, "createdAt", "updatedAt") VALUES (?, ?, ? , ?)`,
            {
                replacements: [
                    Year, Type,
                    new Date(), new Date()

                ], type: sequelize.QueryTypes.INSERT
            }
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
        const semesters = await sequelize.query(
            `SELECT * FROM semesters ORDER BY semester_id DESC LIMIT 1`,
            { type: sequelize.QueryTypes.SELECT }
        );
        console.log("hello", semesters);

        if (semesters.length > 0) {
            return res.status(200).json(new ApiResponse(200, semesters[0]));
        } else {
            return res.status(204).json(new ApiResponse(204, "No semesters found"));
        }
    } catch (error) {
        next(error); // Pass error to the global error handler
    }
});


const register_Semester_Passenger = asynchandler(async (req, res, next) => {
    try {
        const { semester_id, passenger_id, pickup, dropoff, bus_id } = req.body;
        if (!semester_id || !passenger_id || !pickup || !dropoff || !bus_id) {
            return next(new ApiError(400, "Please provide all required fields"));
        }
        const [getPassenger] = await sequelize.query(`SELECT * FROM semester_passengers  WHERE semester_id = '
            ${semester_id}' AND passenger_id = '${passenger_id}'`, { type: sequelize.QueryTypes.SELECT });
        if (getPassenger) {
            return next(new ApiError(400, "Passenger already registered for this semester"));
        }
        const [getBus] = await sequelize.query(`SELECT * FROM buses WHERE bus_id = '${bus_id}'`, { type: sequelize.QueryTypes.SELECT });
        console.log(getBus);
        if (!getBus) {
            return next(new ApiError(400, "Bus not found"));
        }
        if (getBus.seats <= 0) {
            return next(new ApiError(400, "Bus is full"));
        }
        if (getBus.seats <= 0) {
            return next(new ApiError(400, "Bus is full"));
        }
        const passenger = await sequelize.query(
            `INSERT INTO semester_passengers 
              (semester_id, passenger_id, pickup, dropoff, bus_id, amount, "createdAt", "updatedAt") 
             VALUES (:semester_id, :passenger_id, :pickup, :dropoff, :bus_id, :amount, :createdAt, :updatedAt ) 
             RETURNING *`,
            {
                type: sequelize.QueryTypes.INSERT,
                replacements: {
                    semester_id,
                    passenger_id,
                    pickup,
                    dropoff,
                    bus_id,
                    amount: 4600,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );
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
        const { semester_passenger_id } = req.body;
        const [getorganization] = await sequelize.query(`SELECT * FROM transport_organizations WHERE owner = '${req.user.user_id}'`,
            { type: sequelize.QueryTypes.SELECT });
        if (!req.user.admin && !getorganization) {
            return next(new ApiError(400, "Unauthorized"));
        }


        const [getPassenger] = await sequelize.query(
            `SELECT passenger_id FROM semester_passengers a inner join buses b on a.bus_id = b.bus_id
            inner join busregistrations c on b.bus_organization = c.organization
            inner join users d on a.passenger_id = d.user_id
            where is_paid = false and b.bus_organization = ? and a."createdAt" < c.due_date and semester_passenger_id=?`, {
            replacements: [getorganization.organization_id, semester_passenger_id]
            , type: sequelize.QueryTypes.SELECT
        });
        if (!getPassenger) {
            return next(new ApiError(400, "Passenger not found"));
        }
        const transaction = await sequelize.transaction();
        const pay = await sequelize.query(
            `UPDATE semester_passengers 
             SET is_paid = ?, amount = ? 
             WHERE semester_passenger_id = ? 
             RETURNING *`,
            {
                type: sequelize.QueryTypes.UPDATE,
                replacements: [true, 0, semester_passenger_id],
                transaction
            }
        );
        if (pay) {
            const checkseats = await sequelize.query(`SELECT * FROM buses WHERE bus_id =
                (SELECT bus_id FROM semester_passengers WHERE semester_passenger_id = '${semester_passenger_id}')`, { type: sequelize.QueryTypes.SELECT });
            if (!checkseats) {
                return next(new ApiError(400, "Error checking bus seats"));
            }
            if (checkseats[0].seats <= 0) {
                transaction.rollback();
                return next(new ApiError(400, "Bus is full"));
            }
            else {
                transaction.commit();
                const updateseats = await sequelize.query(`UPDATE buses SET seats = seats + 1 WHERE bus_id =
                (SELECT bus_id FROM semester_passengers WHERE semester_passenger_id = '${semester_passenger_id}') returning *`, { type: sequelize.QueryTypes.UPDATE });
                if (!updateseats) {
                    return next(new ApiError(400, "Error updating bus seats"));
                }
                return res.status(200).json(new ApiResponse(200, "Payment successful"));
            }
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

const confirm_Payment = asynchandler(async (req, res, next) => {
    try {
        const { semester_passenger_id } = req.body;
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

const show_card = asynchandler(async (req, res, next) => {
    try {
        const passenger_id = req.user.user_id;
        const [getPassenger] = await sequelize.query(`SELECT * FROM semester_passengers a
            inner join buses b on a.bus_id = b.bus_id
             WHERE
             passenger_id = '${passenger_id}' and is_paid = true`, { type: sequelize.QueryTypes.SELECT });
        if (!getPassenger) {
            const [single_ride_passenger] = await sequelize.query(`
                SELECT * 
                FROM singleridepassengers a
                inner join buses b on a.bus_id = b.bus_id
                WHERE single_ride_passenger_id = :passenger_id 
                AND ride_date >= NOW() - INTERVAL '1 day' and is_paid = true
              `, {
                replacements: { passenger_id: passenger_id },
                type: sequelize.QueryTypes.SELECT
              });

            if (!single_ride_passenger) {
                return next(new ApiError(400, "No details found"));
            }
            else {
            
                return res.status(200).json(new ApiResponse(200, single_ride_passenger));
            }
        }
        console.log(getPassenger);
        return res.status(200).json(new ApiResponse(200, getPassenger));
    } catch (error) {
        next(error);
    }
});


export { create_Semester, confirm_Payment, get_Semesters, show_card, register_Semester_Passenger, get_Semester_Passengers, getBill, pay_Semester_Passenger };