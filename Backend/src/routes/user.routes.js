import { Router } from "express";
import {
  Signup,
  getalluser,
  getuser,
  signin,
  signout,
  updateuser,
  deleteuser,
  resetpassword,
  isuseradmin,
  forgetpassword,
  ChangePasword,
  verifyuser,
  resendotp
} from "../controllers/User.controller.js";
import AuthenticateToken from "../middlewares/Authenticate_token.js";
const UserRouter = Router();

UserRouter.route("/user").put(AuthenticateToken, updateuser);
UserRouter.route("/users").get(AuthenticateToken, getalluser);
UserRouter.route("/user/").get(AuthenticateToken, getuser);
UserRouter.route("/user").delete(AuthenticateToken, deleteuser);
UserRouter.route("/user").post(Signup); // Create User
UserRouter.route("/user/login").post(signin); // Login User
UserRouter.route("/user/logout").post(AuthenticateToken, signout); // Logout User
UserRouter.route("/user/forgetpassword").post(forgetpassword); // Forgot password
UserRouter.route("/user/resetpassword").post(resetpassword); // Forgot password
UserRouter.route("/user/isadmin").get(AuthenticateToken, isuseradmin); // Check if user is admin
UserRouter.route("/user/changepassword").put(AuthenticateToken, ChangePasword); // Change password
UserRouter.route("/user/verifyuser").put(verifyuser); // Change password
UserRouter.route("/user/resend-otp").post(resendotp); // Change otp

export default UserRouter;
