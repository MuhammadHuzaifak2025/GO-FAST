// import employee from "../models/employee.model.js";
import user from "../models/user.models.js";
import asynchandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ErrorHandling.js";
import ApiResponse from "../utils/ResponseHandling.js";
import GenerateToken from "../utils/GenerateToken.js";
import bcrypt from "bcrypt";
import keygen from "keygen";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import otpGenerator from 'otp-generator'
// var MailChecker = require('mailchecker');
import MailChecker from 'mailchecker';
import sequelize from "../database/index.js";
import User from "../models/user.models.js";
import { QueryTypes } from "sequelize";
import Transport_Organization from "../models/Transport_Organization/index.model.js";
import { aj } from "../app.js";


const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);


const Signup = asynchandler(async (req, res, next) => {
  try {
    const { username, email, password, phone, address, license } = req.body;

    if (!username || !password || !email || !phone || !address) {
      return next(new ApiError(400, "please fill all the fields: username, email, password, phone, address"));
    }



    const userexsist = await user.findOne({ where: { username } });
    const userexsistemail = await user.findOne({ where: { email } });
    if (userexsist || userexsistemail) {
      if (userexsistemail) {
        return next(new ApiError(400, "User already exists with same email"));
      }
      else {
        return next(new ApiError(400, "User already exists with same username"));
      }
    }
    const decision = await aj.protect(req, {
      email: email,
    });
    console.log("Arcjet decision", decision);

    if (decision.isDenied()) {
      return next(new ApiError(400, "Invalid Email Address"));
    }
    const plainKey = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });

    if (!MailChecker.isValid(email)) {
      return next(new ApiError(400, "Invalid Email Address"));
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: { address: process.env.GMAIL_USERNAME, username: "GO-FAST" },
        to: email,
        subject: "Verify User",
        text: `Your New OTP key is ${plainKey}. Enter your key to reset your password.`,
      });

      if (!info) {
        return next(new ApiError(500, "Email not sent"));
      }

    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return next(new ApiError(500, "Failed to send verification email. Please try again later."));
    }

    console.log(plainKey);
    const newuser = await user.create({
      username: username,
      email: email,
      password: password,
      phone: phone,
      address: address,
      license: license || null,
    });

    if (newuser) {
      newuser.password = undefined;
      const [access_token, refresh_token] = GenerateToken(newuser);
      if (refresh_token === null || access_token === null) {
        return next(new ApiError(500, "Token Generation Failed"));
      }
      const addrefreshtoken = await user.update(
        { refreshtoken: refresh_token },
        { where: { user_id: newuser.user_id } }
      );
      if (!addrefreshtoken) {
        return next(new ApiError(500, "Token Generation Failed"));
      }
      res.cookie("refresh-token", refresh_token, {
        httpOnly: true,
        secure: true,
        maxAge: 3600 * 100000,
        path: "/",
        sameSite: "none",
      });
      res.cookie("access-token", access_token, {
        httpOnly: true,
        secure: true,
        path: "/",
        maxAge: 3600 * 1000,
        sameSite: "none",
      });
      const updateduser = await user.update(
        {
          otp: await bcrypt.hash(plainKey, saltRounds),
          is_verified: false
        },
        { where: { email: email } }
      );
      if (!updateduser) {
        return next(new ApiError(500, "User not updated"));
      }

      res.status(201).json(new ApiResponse(200, newuser, "User Created, Verify Your Email"));
    }
  } catch (error) {
    next(new ApiError(500, error));
  }
});

const verifyuser = asynchandler(async (req, res, next) => {
  try {
    const { email, key } = req.body;
    if (!email || !key) {
      return next(new ApiError(400, "Please fill all the fields"));
    }

    const userexsist = await user.findOne({ where: { email } });
    if (!userexsist) {
      return next(new ApiError(400, "User does not exist"));
    }

    const result1 = await bcrypt.compare(key, userexsist.otp);

    if (!result1)
      return next(new ApiError(402, "Incorrect Key"));


    const updateduser = await user.update(
      {
        is_verified: true,
        otp: null,
      },
      { where: { email: email } }
    );

    res
      .status(200)
      .json(new ApiResponse(200, "User Verified"));
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
});


const getalluser = asynchandler(async (req, res, next) => {
  try {
    const users = await user.findAll();
    if (users) {
      res.status(200).json(new ApiResponse(200, users, "Users Found"));
    }
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
});

const getuser = asynchandler(async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const users = await user.findOne({ where: { user_id } });
    users.password = undefined;
    users.refreshtoken = undefined;

    if (users) {
      res.status(200).json(new ApiResponse(200, users, "User Found"));
    }
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
});

const signin = asynchandler(async (req, res, next) => {
  try {
    const { username, password } = req.body;

    let userexsist = await user.findOne({ where: { username } });
    if (!userexsist) userexsist = await user.findOne({ where: { email: username } });

    if (!userexsist) {
      return next(new ApiError(400, "User does not exists"));

    }
    // if (userexsist.is_verified === false) {
    //   res.status(201).json(new ApiResponse(201, userexsist, "User Logged In"));
    // }
    const passcorrect = await bcrypt.compare(password, userexsist.password);
    if (!passcorrect) {
      return next(new ApiError(400, "Password is incorrect"));

    }

    userexsist.password = undefined;
    if (userexsist.is_verified === false) {
      return res.status(201).json(new ApiResponse(201, userexsist, "User not verified"));
    }

    const [access_token, refresh_token] = GenerateToken(userexsist);
    if (refresh_token === null || access_token === null) {
      return next(new ApiError(500, "Token Generation Failed"));

    }
    const addrefreshtoken = await user.update(
      { refreshtoken: refresh_token },
      { where: { user_id: userexsist.user_id } }
    );
    if (!addrefreshtoken) {
      return next(new ApiError(500, "Token Generation Failed"));
      //   throw new ApiError(500, "Token Generation Failed");
    }
    if (userexsist.admin) {
      const transporter = await Transport_Organization.findOne({ where: { owner: userexsist.user_id } });
      if (!transporter) {
        return next(new ApiError(400, "User is not a transporter"));
      }
    }

    res.cookie("refresh-token", refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600 * 100000,
      path: "/",
      sameSite: "none",
    });
    res.cookie("access-token", access_token, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 3600 * 1000,
      sameSite: "none",
    });
    userexsist.refresh_token = undefined;


    res.status(200).json(new ApiResponse(200, userexsist, "User Logged In"));
  } catch (error) {
    return next(new ApiError(500, error.message));
    // throw new ApiError(500, error.message);
  }
});

const signout = asynchandler(async (req, res, next) => {
  try {
    res.clearCookie("refresh-token", {
      path: "/",
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("access-token", {
      secure: true,
      path: "/",
      sameSite: "none",
    });

    res.status(200).json(new ApiResponse(200, {}, "User Logged Out"));
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
});

const updateuser = asynchandler(async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const { username, email, password, phone, address, license } = req.body;
    if (!(username || email)) {
      return next(new ApiError(400, "Please fill all the required fields: username, email"));

    }
    const userexsist = await user.findOne({ where: { user_id } });
    if (!userexsist) {
      return next(new ApiError(400, "User does not exists"));

    }
    const updateduser = await user.update({ username, email, address, phone, license }, { where: { user_id } });
    if (updateduser) {
      const updateduser = await user.findOne({ where: { user_id } });
      updateduser.password = undefined;
      updateduser.refreshtoken = undefined;
      res.status(200).json(new ApiResponse(200, updateduser, "User Updated"));
    }
  } catch (error) {
    return next(new ApiError(500, error.message));

  }
});

const deleteuser = asynchandler(async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const userexsist = await user.findOne({ where: { user_id } });
    if (!userexsist) {
      return next(new ApiError(400, "User does not exists"));
    }
    const deleteduser = await user.destroy({ where: { user_id } });
    if (deleteduser) {
      res.clearCookie("refresh-token");
      res.clearCookie("access-token");


      res.status(200).json(new ApiResponse(200, {}, "User Deleted"));
    }
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
});
const forgetpassword = asynchandler(async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ApiError(400, "Please fill all the fields"));
    }

    const userexsist = await user.findOne({ where: { email } });
    if (!userexsist) {
      return next(new ApiError(400, "User does not exist at this Email"));
    }

    if (userexsist.is_verified === false) {
      return next(new ApiError(400, "User is not verified"));
    }


    const plainKey = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });

    console.log(plainKey);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const info = transporter.sendMail({
      from: { address: process.env.GMAIL_USERNAME, username: "GO-FAST" },
      to: email,
      subject: "Forget Password",
      text: `Your New OTP key is ${plainKey}. Enter your key to reset your password.`,
    });

    if (!info) {
      return next(new ApiError(500, "Email not sent"));
    }

    const updateduser = await user.update(
      {
        otp: await bcrypt.hash(plainKey, saltRounds),
        forgetpassword: true,
        // password: await bcrypt.hash(plainKey, saltRounds),
      },
      { where: { email: email } }
    );

    res
      .status(200)
      .json(new ApiResponse(200, ["A Key has been sent to your email"]));
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
});

const resetpassword = asynchandler(async (req, res, next) => {



  try {
    const { email, key, password } = req.body;

    if (!email || !key || !password) {
      return next(
        new ApiError(400, "Please fill all the fields: email, key, password")
      );
    }
    const userexsist = await user.findOne({ where: { email } });
    if (!userexsist) {
      return next(new ApiError(400, "User does not exist"));
    }

    // console.log(userexsist);
    const isKeyCorrect = await bcrypt.compare(key, userexsist.otp);
    if (!isKeyCorrect) {
      return next(new ApiError(403, "Incorrect Key"));
    }

    const password_updated = await user.update(
      {
        forgetpassword: false,
        password: await bcrypt.hash(password, saltRounds), // This will be hashed automatically by your Sequelize hook
      },
      { where: { email: email } }
    );
    if (password_updated)
      res.status(200).json(new ApiResponse(200, "User Password Updated"));
  } catch (error) {
    return next(new ApiError(500, "Internal Server Error"));
  }
});
const ChangePasword = asynchandler(async (req, res, next) => {
  const { email, username, password } = req.body;

  if (!email || !key || !password) {
    return next(
      new ApiError(400, "Please fill all the fields: email or username, password")
    );
  }

  try {
    let userexsist;
    userexsist = await user.findOne({ where: { email } });
    if (!userexsist) {
      userexsist = await user.findOne({ where: { username } });
      if (!userexsist) {
        return next(new ApiError(400, "User does not exist"));
      }
    }
    const password_updated = await user.update(
      {
        forgetpassword: false,
        password: await bcrypt.hash(password, saltRounds), // This will be hashed automatically by your Sequelize hook
      },
      { where: { email: email } }
    );
    if (password_updated)
      res.status(200).json(new ApiResponse(200, "User Password Updated"));
  } catch (error) {
    return next(new ApiError(500, "Internal Server Error"));
  }
});

const isuseradmin = asynchandler(async (req, res, next) => {
  try {
    if (req.admin === true) {
      console.log("User is Admin");
      res.status(200).json(new ApiResponse(200, "User is Admin"));
    }
    res.status(200).json(new ApiResponse(400, "User is not Admin"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});
const resendotp = asynchandler(async (req, res, next) => {
  try {
    const { username, email } = req.body;
    if (!username && !email) {
      return next(new ApiError(400, "Please fill all the fields: username or email"));
    }

    let userexsist = await user.findOne({ where: { username } });
    userexsist = userexsist ? userexsist : await user.findOne({ where: { email } });
    if (!userexsist) {
      return next(new ApiError(400, "User does not exist at this Email"));
    }
    if (userexsist.is_verified) {
      return next(new ApiError(400, "User is already verified"));
    }
    const plainKey = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    console.log(plainKey);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: { address: process.env.GMAIL_USERNAME, username: "GO-FAST" },
        to: userexsist.email,
        subject: "Verify Your Account",
        text: `Your New OTP key is ${plainKey}. Enter your key to reset your password.`,
      });

      if (!info) {
        return next(new ApiError(500, "Email not sent"));
      }

      const updateduser = await user.update(
        {
          otp: await bcrypt.hash(plainKey, saltRounds),
          is_verified: false
        },
        { where: { username: username } }
      );
      return res.status(200).json(new ApiResponse(200, "A Key has been sent to your email"));

    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return next(new ApiError(500, "Failed to send verification email. Please try again later."));
    }

  } catch (error) {
    return next(new ApiError(500, error.message));
  }
});

const make_admin = asynchandler(async (req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const get_admin = await sequelize.query(`select * from Users where user_id = ${user_id}`, {
      type: QueryTypes.SELECT
    });
    if (!get_admin) {
      return next(new ApiError(401, "User does not exist"));
    }
    if (get_admin[0].admin) {
      return next(new ApiError(401, "User is already an admin"));
    }
    else {
      const make_admin = await User.update(
        { admin: true },
        { where: { user_id: user_id } }
      );
      if (make_admin) {
        return res.status(201).json(new ApiResponse(201, "User Maked Admin Succesfully"));
      }
    }
    return next(new ApiError(401, "Error"));
  } catch (error) {
    next(error);
  }
});

const createAdmin = asynchandler(async (req, res, next) => {
  try {
    if (req.user.is_super_admin === false) {
      return next(new ApiError(401, "You are not allowed to create admin"));
    }
    const { username, email, password, phone, address, license } = req.body;
    if (!username || !password || !email) {
      return next(new ApiError(400, "please fill all the fields: username, email, password, phone, address"));
    }
    const userexsist = await user.findOne({ where: { username } });
    const userexsistemail = await user.findOne({ where: { email } });
    if (userexsist || userexsistemail) {
      if (userexsistemail) {
        return next(new ApiError(400, "User already exists with same email"));
      }
      else {
        return next(new ApiError(400, "User already exists with same username"));
      }
    }

    const newuser = await user.create({
      username: username,
      email: email,
      password: password,
      phone: phone,
      address: address,
      license: license || null,
      admin: true,
      is_super_admin: false
    });
    if (newuser) {
      newuser.password = undefined;
      res.status(201).json(new ApiResponse(200, newuser, "User Created"));
    }
  } catch (error) {
    next(error);

  }
});


export {
  make_admin,
  updateuser,
  Signup,
  getalluser,
  getuser,
  signin,
  signout,
  resetpassword,
  deleteuser,
  forgetpassword,
  isuseradmin,
  ChangePasword,
  verifyuser,
  resendotp,
  createAdmin
};
