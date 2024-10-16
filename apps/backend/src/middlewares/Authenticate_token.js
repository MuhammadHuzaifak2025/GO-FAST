import jwt, { decode } from "jsonwebtoken";
import user from "../models/user.models.js";
import GenerateToken from "../utils/GenerateToken.js"; // Assuming you have a function to generate tokens
import ApiError from "../utils/ErrorHandling.js";


const AuthenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies["access-token"];
    const refresh_token = req.cookies["refresh-token"];

    if (!token) {
      if (!refresh_token) {
        console.log("No refresh token found");
        return res
          .status(401)
          .json({ message: "Unauthorized (no token found)" });
      }
      console.log("No token found");

      const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
      console.log(decoded);
      const userexist = await user.findOne({ where: { user_id: decoded.user_id } });

      //   console.log(refresh_token === userexist.refreshtoken);
      if (!userexist || userexist.refreshtoken !== refresh_token) {
        return res
          .status(401)
          .json({ message: "Unauthorized- User Does Not Exsist" });
      }

      const [newAccessToken] = GenerateToken(userexist);
      if (!newAccessToken) {
        return res.status(500).json({ message: "Token Generation Failed" });
      }
      await res.cookie("access-token", newAccessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 3600 * 1000,
      });

      req.user = userexist;
      next();
    } else {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      req.user = await user.findOne({ where: { user_id: decoded.user_id } });
      if (req.user === null) {
        return res
          .status(401)
          .json({ message: "Unauthorized- User Does Not Exsist" });
      }

      console.log(req.admin);
      next();
    }
  } catch (error) {
    return res.status(500).json(new ApiError(500, {},error.message));
    // return res.status(500).json({ message: error.message });
  }
};

export default AuthenticateToken;
