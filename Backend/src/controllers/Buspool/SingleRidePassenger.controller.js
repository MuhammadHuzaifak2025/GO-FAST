import { QueryTypes } from "sequelize";
import sequelize from "../../database/index.js";
import asynchandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ErrorHandling.js";
import ApiResponse from "../../utils/ResponseHandling.js";


const RequestforSingleRide = asynchandler(async (req, res, next) => { // Create a new request for a single ride
    try {
        const { bus_id, ride_date } = req.body;
        const passenger_id = req.user.user_id;
        const getsinglepassenger = await sequelize.query(`SELECT * FROM singleridepassengers where passenger_id = ?
        and ride_date = ?`, { replacements: [passenger_id, ride_date], type: QueryTypes.SELECT });
        if (getsinglepassenger[0]) {
            return next(new ApiError(400, "You have already requested for a ride on this date"));
        }
        const [semester_id] = await sequelize.query(`SELECT * FROM semesters order by semester_id desc limit 1`,
            { type: QueryTypes.SELECT });
        if (!semester_id) {
            return next(new ApiError(400, "No Semester Found"));
        }
        if (!bus_id || !ride_date) {
            return next(new ApiError(400, "Please provide all fields"));
        }
        const [getBus] = await sequelize.query(`SELECT * FROM buses where bus_id = ?`,
            { replacements: [bus_id], type: QueryTypes.SELECT });
        if (!getBus) {
            return next(new ApiError(400, "Bus not found"));
        }
        if (getBus.seats <= 0) {
            return next(new ApiError(400, "Bus is full"));
        }
        const [getPassenger] = await sequelize.query(`SELECT * FROM semester_passengers where semester_id = ? and passenger_id = ?`,
            { replacements: [semester_id.semester_id, passenger_id], type: QueryTypes.SELECT });

        if (getPassenger) {
            return next(new ApiError(400, "Passenger already registered for this semester, cant request for single ride"));
        }

        const [createPassenger] = await sequelize.query(`INSERT INTO singleridepassengers
        (bus_id,passenger_id, is_paid, ride_date, "createdAt", "updatedAt")
        VALUES (?,?,?,?,?,?) Returning *`,
            { replacements: [bus_id, req.user.user_id, false, ride_date, new Date(), new Date()], type: QueryTypes.INSERT });
        const [updateBus] = await sequelize.query(`UPDATE buses SET seats = seats - 1 where bus_id = ? Returning *`,
            { replacements: [bus_id], type: QueryTypes.UPDATE });
        if (createPassenger && updateBus) {
            return res.status(200).json(new ApiResponse(200, createPassenger));
        }
        return next(new ApiError(400, "Error Registering Passenger"));
    } catch (error) {
        next(error);
    }

});

const showSingleRidePassenger_toAdmin = asynchandler(async (req, res, next) => { // Show all single ride passengers to admin
    try {
        const [semester_id] = await sequelize.query(`SELECT * FROM semesters order by semester_id desc limit 1`,
            { type: QueryTypes.SELECT });
        if (!semester_id) {
            return next(new ApiError(400, "No Semester Found"));
        }

        const semester_passengers = await sequelize.query(`select * from singleridepassengers a
            inner join buses b on a.bus_id = b.bus_id
            inner join transport_organizations c on b.bus_organization = c.organization_id
            where c.owner = ? `,
            { replacements: [req.user.user_id, new Date()], type: QueryTypes.SELECT });

        return res.status(200).json(new ApiResponse(200, semester_passengers));
        return next(new ApiError(400, "No Busses Found"));
    } catch (error) {
        next(error);
    }
}
);

const approveSingleRidePassenger = asynchandler(async (req, res, next) => { // Approve a single ride passenger
    try {
        const [getuserorganization] = await sequelize.query(
            `SELECT * FROM transport_organizations WHERE owner =?`,
            { replacements: [req.user.user_id], type: QueryTypes.SELECT }
        );
        if (!getuserorganization) {
            return next(new ApiError(400, "Organization not found"));
        }
        const { single_ride_passenger_id } = req.params;
        const [getPassenger] = await sequelize.query(`SELECT * FROM singleridepassengers where single_ride_passenger_id = ?`,
            { replacements: [single_ride_passenger_id], type: QueryTypes.SELECT });
        if (!getPassenger) {
            return next(new ApiError(400, "Passenger not found"));
        }
        const [approvePassenger] = await sequelize.query(`UPDATE singleridepassengers SET is_paid = true where single_ride_passenger_id = ? Returning *`,
            { replacements: [single_ride_passenger_id], type: QueryTypes.UPDATE });
        if (approvePassenger) {
            return res.status(200).json(new ApiResponse(200, approvePassenger));
        }
        return next(new ApiError(400, "Error Approving Passenger"));
    } catch (error) {
        next(error);
    }
}
);

const fetch_my_single_ride_passengers = asynchandler(async (req, res, next) => { // Fetch all single ride passengers
    try {
        const [semester_id] = await sequelize.query(`SELECT * FROM semesters order by semester_id desc limit 1`,
            { type: QueryTypes.SELECT });
        if (!semester_id) {
            return next(new ApiError(400, "No Semester Found"));
        }
        const [getPassenger_semester] = await sequelize.query(`SELECT * FROM semester_passengers where semester_id = ? and passenger_id = ?`,
            { replacements: [semester_id.semester_id, req.user.user_id], type: QueryTypes.SELECT });

        if (getPassenger_semester) {
            // return next(new ApiError(202, "Passenger already registered for this semester, cant request for single ride"));
            res.status(202).json(new ApiResponse(202, "Passenger already registered for this semester, cant request for single ride"));
        }
        const [getPassenger] = await sequelize.query(`SELECT * FROM singleridepassengers a 
            inner join buses b on a.bus_id = b.bus_id
            inner join transport_organizations c on b.bus_organization = c.organization_id
            where passenger_id = ? `,
            { replacements: [req.user.user_id], type: QueryTypes.SELECT });
        if (getPassenger) {
            const [getroutes] = await sequelize.query(`SELECT * FROM routes a inner join busroutes b on a.route_id = b.route_id where b.bus_id = ?`,
                { replacements: [getPassenger.bus_id], type: QueryTypes.SELECT });
            getPassenger.routes = getroutes;
            return res.status(200).json(new ApiResponse(200, getPassenger));
        }
        return next(new ApiError(400, "No Passengers Found"));
    } catch (error) {
        next(error);
    }
}
);


const reject_single_ride_passenger = asynchandler(async (req, res, next) => { // Reject a single ride passenger
    try {
        const [getuserorganization] = await sequelize.query(
            `SELECT * FROM transport_organizations WHERE owner =?`,
            { replacements: [req.user.user_id], type: QueryTypes.SELECT }
        );
        if (!getuserorganization) {
            return next(new ApiError(400, "Organization not found"));
        }
        const { single_ride_passenger_id } = req.params;
        const [getPassenger] = await sequelize.query(`SELECT * FROM singleridepassengers where single_ride_passenger_id = ?`,
            { replacements: [single_ride_passenger_id], type: QueryTypes.SELECT });
        if (!getPassenger) {
            return next(new ApiError(400, "Passenger not found"));
        }
        const [rejectPassenger] = await sequelize.query(`DELETE FROM singleridepassengers where single_ride_passenger_id = ? Returning *`,
            { replacements: [single_ride_passenger_id], type: QueryTypes.DELETE });
        if (rejectPassenger) {
            return res.status(200).json(new ApiResponse(200, rejectPassenger));
        }
        return next(new ApiError(400, "Error Rejecting Passenger"));
    } catch (error) {
        next(error);
    }
}
);
const showSingleRideBusses_toUser = asynchandler(async (req, res, next) => { // Show all single ride passengers to user
    try {
        const [semester_id] = await sequelize.query(`SELECT * FROM semesters order by semester_id desc limit 1`,
            { type: QueryTypes.SELECT });
        if (!semester_id) {
            return next(new ApiError(400, "No Semester Found"));
        }

        const transport_organizations = await sequelize.query(`select * from transport_organizations a 
            inner join busregistrations b
            on a.organization_id = b.organization inner join semesters c on b.semester_id = c.semester_id where c.semester_id = ?`,
            { replacements: [semester_id.semester_id, new Date()], type: QueryTypes.SELECT });

        if (!transport_organizations[0]) {
            return next(new ApiError(400, "No Transport Organization Found"));
        }
        if (transport_organizations[0].due_date > new Date()) {
            return next(new ApiError(400, "Semester Registration are only open for now"));
        }
        transport_organizations[0].due_date = new Date();
        // console.log(transport_organizations);
        for (const organization of transport_organizations) {
            const busses = await sequelize.query(`select * from buses where bus_organization = ? and seats > 0`,
                { replacements: [organization.organization_id], type: QueryTypes.SELECT });
            organization.busses = busses;
            for (const bus of busses) {
                const busroutes = await sequelize.query(`select * from routes a inner join busroutes b on a.route_id = b.route_id `,
                    { replacements: [bus.bus_id], type: QueryTypes.SELECT });
                console.log("busses", busroutes);
                bus.routes = busroutes;
                bus.semester = semester_id;
            }

        }
        if (transport_organizations) {
            return res.status(200).json(new ApiResponse(200, transport_organizations));
        }
        return next(new ApiError(400, "No Busses Found"));
    } catch (error) {
        next(error);
    }
}
);

export {
    RequestforSingleRide,
    fetch_my_single_ride_passengers,
    showSingleRidePassenger_toAdmin,
    approveSingleRidePassenger,
    reject_single_ride_passenger,
    showSingleRideBusses_toUser
};