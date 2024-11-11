import sequelize from "../database/index.js";
import { QueryTypes } from "sequelize";

const processRideRequest = async (data) => {
    try {
        console.log(data)
        const rideId = data.ride_id;
        console.log(rideId)
        if (!rideId) {
            return next(new ApiError(401, "Please provide a ride id"));
        }

        const ride = await sequelize.query(
            `select * from ride_requests where request_id = ? `,
            {
                replacements: [rideId],
                type: QueryTypes.SELECT,
            });
        console.log(ride)

        return ride[0];
    } catch (error) {
        throw new Error("Error processing ride request");
    }
}



export { processRideRequest };