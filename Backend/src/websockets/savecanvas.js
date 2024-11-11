// import { CanvasJson } from "../models/canvas_json.js";
// import { Poster } from "../models/poster.model.js";
// import ApiError from "../utils/ErrorHandling.js";
// import ApiResponse from "../utils/ResponseHandling.js";
// const save_canvas = async (poster_id, design) => {
//     try {
//         if (poster_id && !design) {
//             throw new ApiError("Design is required to save canvas");
//         }
//         let poster = null;
//         if (poster_id) {
//             poster = await Poster.findById(poster_id);
//             if (!poster) {
//                 throw new ApiError("Poster not found");
//             }
//         }
//         const canvasJson = new CanvasJson({
//             json: design,
//         });
//         await canvasJson.save();
//         if (poster) {
//             poster.canvas_json.push(canvasJson._id);
//             const saved = await poster.save();
//             return new ApiResponse(200, "Canvas saved successfully", saved);
//         }


//     } catch (error) {
//         return new ApiError(400, error.message);
//     }
// };

// export { save_canvas };