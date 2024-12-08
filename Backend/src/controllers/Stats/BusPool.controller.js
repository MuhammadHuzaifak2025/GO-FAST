import Bus from "../../models/Buspool/Bus.model.js";
import busRegistration from "../../models/Buspool/bus_registration_models.js";
import SingleRidePassenger from "../../models/Buspool/single_ride_passenger.model.js";
import semester_passenger from "../../models/Buspool/semester_passenger.model.js";
import asynchandler from "../../utils/AsyncHandler.js";
import ApiError from "../../utils/ErrorHandling.js";
import ApiResponse from "../../utils/ResponseHandling.js";
import Transport_Organization from "../../models/Transport_Organization/index.model.js";
import CarpoolRide from "../../models/carpool/carpool_ride.models.js";
import Semester from "../../models/Buspool/semester.model.js";
import { Op } from "sequelize";
import ride_passenger from "../../models/carpool/ride_passenger.models.js";

const get_bus_ratio = asynchandler(async (req, res, next) => {
    try {
        const bus_org = await Transport_Organization.findOne({ where: { owner: req.user.user_id } });
        if (!bus_org) {
            return next(new ApiError(404, "No bus organization found for this user"));
        }

        const buses = await Bus.findAll({ where: { bus_organization: bus_org.organization_id } });
        const busIds = buses.map(b => b.bus_id);

        const latestSemester = await Semester.findOne({ order: [['createdAt', 'DESC']] });
        if (!latestSemester) {
            return next(new ApiError(404, "No semester data found"));
        }

        const semesterPassengersCount = await semester_passenger.count({
            where: { bus_id: busIds, semester_id: latestSemester.semester_id }
        });

        const singleRidePassengersCount = await SingleRidePassenger.count({
            where: {
                bus_id: busIds,
                createdAt: { [Op.gte]: latestSemester.createdAt }
            }
        });

        return res.json(new ApiResponse(200, {
            single_ride_passengers: singleRidePassengersCount,
            semester_passengers: semesterPassengersCount
        }));
    } catch (error) {
        next(error);
    }
});


const seatleft = asynchandler(async (req, res, next) => {
    try {
        const bus_org = await Transport_Organization.findOne({ where: { owner: req.user.user_id } });
        if (!bus_org) return next(new ApiError(404, "No bus organization found for this user"))
        const bus = (await Bus.findAll({ where: { bus_organization: bus_org.organization_id }, attributes: ['seats', 'total_seats', 'bus_id', 'bus_number'] }));
        return res.json(new ApiResponse(200, { bus }));
    } catch (error) {
        next(error);
    }
});


const get_this_month_rides_driver = asynchandler(async (req, res, next) => {
    try {
        // Get the start and end of the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // Fetch all rides for the current driver in the current month
        const thisMonthRides = await CarpoolRide.findAll({
            where: {
                driver: req.user.user_id,
                createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
            },
        });

        // Log for debugging: Check the type and content of `thisMonthRides`
        console.log("thisMonthRides:", thisMonthRides);

        // Ensure `thisMonthRides` is an array
        if (!Array.isArray(thisMonthRides)) {
            throw new Error("Unexpected data type for thisMonthRides. Expected an array.");
        }

        // Calculate the total fare
        const fareSum = thisMonthRides.reduce((acc, ride) => acc + (ride.fare || 0), 0); // Handle cases where `fare` might be undefined

        // Return the ride count and fare sum
        return res.json(new ApiResponse(200, {
            this_month_rides: thisMonthRides.length,
            total_fare: fareSum
        }));
    } catch (error) {
        console.error("Error in get_this_month_rides_driver:", error); // Log error for debugging
        next(error); // Pass the error to the next middleware
    }
});


const get_this_month_passenger_spending = asynchandler(async (req, res, next) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const thisMonthRides = await CarpoolRide.findAll({
            where: {
                driver: req.user.user_id,
                createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
                ride_status: "completed",
            },
        });
        if (!Array.isArray(thisMonthRides)) {
            throw new Error("Unexpected data type for thisMonthRides. Expected an array.");
        }

        const totalSpent = thisMonthRides.reduce((acc, ride) => acc + ride.fare, 0);

        return res.json(new ApiResponse(200, { total_spent: totalSpent }));
    } catch (error) {
        next(error);
    }
});

const get_total_rides_driver = asynchandler(async (req, res, next) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const totalRides = await CarpoolRide.findAll({
            where: {
                driver: req.user.user_id,
                createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
            }
        });
        if (!Array.isArray(totalRides)) {
            throw new Error("Unexpected data type for totalRides. Expected an array.");
        }
        const sum = totalRides.reduce((acc, ride) => acc + ride.fare, 0);
        return res.json(new ApiResponse(200, { total_rides: totalRides, Sum: sum }));
    } catch (error) {
        next(error);
    }
});

const get_total_passenger_rides = asynchandler(async (req, res, next) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    try {
        const totalRides = await ride_passenger.findAll({
            where: {
                passenger_id: req.user.user_id,
                createdAt: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });
        if (!Array.isArray(totalRides)) {
            throw new Error("Unexpected data type for totalRides. Expected an array.");
        }
        const sum = totalRides.reduce((acc, ride) => acc + ride.fare, 0);
        return res.json(new ApiResponse(200, { total_rides: totalRides, Sum: sum }));
    } catch (error) {
        next(error);
    }
});

const get_monthly_stats = asynchandler(async (req, res, next) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // Fetch rides as driver
        const driverRides = await CarpoolRide.findAll({
            where: {
                driver: req.user.user_id,
                createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
            },
        });

        // Fetch rides as completed driver
        const completedDriverRides = await CarpoolRide.findAll({
            where: {
                driver: req.user.user_id,
                createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
                ride_status: "completed",
            },
        });

        // Fetch rides as passenger
        const passengerRides = await ride_passenger.findAll({
            where: {
                passenger_id: req.user.user_id,
                createdAt: { [Op.between]: [startOfMonth, endOfMonth] },
            },
        });

        // Calculate stats
        const thisMonthRidesCount = driverRides.length;
        const totalFareAsDriver = driverRides.reduce((acc, ride) => acc + (ride.fare || 0), 0);
        const totalSpentAsPassenger = completedDriverRides.reduce((acc, ride) => acc + (ride.fare || 0), 0);
        const totalPassengerRidesCount = passengerRides.length;
        const totalFareAsPassenger = passengerRides.reduce((acc, ride) => acc + (ride.fare || 0), 0);

        // Return combined stats
        return res.json(new ApiResponse(200, {
            this_month_rides_as_driver: thisMonthRidesCount,
            total_fare_as_driver: totalFareAsDriver,
            total_fare_spent_as_passenger: totalSpentAsPassenger,
            total_rides_as_passenger: totalPassengerRidesCount,
            total_fare_as_passenger: totalFareAsPassenger,
        }));
    } catch (error) {
        console.error("Error in get_monthly_stats:", error); // Log for debugging
        next(error); // Pass error to next middleware
    }
});


export { get_bus_ratio, seatleft, get_this_month_rides_driver, get_this_month_passenger_spending, get_total_rides_driver, get_total_passenger_rides, get_monthly_stats };