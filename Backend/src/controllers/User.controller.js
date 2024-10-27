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
      return next(new ApiError(400, "User already exists with same email or username"));
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

    const info = transporter.sendMail({
      from: { address: process.env.GMAIL_USERNAME, username: "GO-FAST" },
      to: email,
      subject: "Verify User",
      text: `Your New Otp key is ${plainKey}. Enter your key to reset your password.`,
    });

    if (!info) {
      return next(new ApiError(500, "Email not sent"));
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
      });
      res.cookie("access-token", access_token, {
        httpOnly: true,
        secure: true,
        maxAge: 3600 * 1000,
      });
      const updateduser = await user.update(
        {
          otp: await bcrypt.hash(plainKey, saltRounds),
          isverified: false
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
      return next(new ApiError(401, "Incorrect Key"));


    const updateduser = await user.update(
      {
        isverified: true,
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
    if (!username || !password) {
      const token = req.cookies["access-token"];
      const refresh_token = req.cookies["refresh-token"];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await user.findOne({ where: { user_id: decoded.user_id } });
        if (req)
          res
            .status(200)
            .json(new ApiResponse(200, req.user, "User Logged In"));
      }
      if (refresh_token) {
        console.log("refresh token");
        const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
        const userexist = await user.findOne({ where: { user_id: decoded.user_id } });
        if (!userexist || userexist.refreshtoken !== refresh_token) {
          res.clearCookie["refresh-token"];
          return next(new ApiError(401, "Unauthorized- User Does Not Exsist"));
        }
        const [newAccessToken] = GenerateToken(userexist);
        if (!newAccessToken) {
          return next(new ApiError(500, "Token Generation Failed"));
        }
        res.cookie("access-token", newAccessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
        req.user = userexist;
        res
          .status(200)
          .json(new ApiResponse(200, req.user, "User Logged In with refresh"));
      }
      return next(new ApiError(
        400,
        "Please fill all the fields required feilds are email and password"
      ));
    }
    let userexsist = await user.findOne({ where: { username } });
    if (!userexsist) userexsist = await user.findOne({ where: { username } });
    console.log(username);
    if (!userexsist) {
      return next(new ApiError(400, "User does not exists"));

    }
    const passcorrect = await bcrypt.compare(password, userexsist.password);
    if (!passcorrect) {
      return next(new ApiError(400, "Password is incorrect"));

    }
    userexsist.password = undefined;
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
    res.cookie("refresh-token", refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600 * 100000,
      path: "/",
    });
    res.cookie("access-token", access_token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600 * 1000,
    });
    userexsist.refresh_token = undefined;

    if (userexsist.isverified === false) {
      return next(new ApiError(400, "User is not verified"));
    }

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
      domain: "localhost",
      sameSite: "Strict",
    });
    res.clearCookie("access-token", {
      path: "/",
      secure: true,
      domain: "localhost",
      sameSite: "Strict",
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
        isverified: userexsist.isverified ? false : true
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
    console.log(userexsist);
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
export {
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
  verifyuser
};
