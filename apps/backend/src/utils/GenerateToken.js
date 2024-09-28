import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const GenerateToken = (user) => {
  if (!user) return null;
  const access_token = jwt.sign(
    {
      username: user.email,
      user_id: user.user_id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  );
  const refresh_token = jwt.sign(
    {
      username: user.email,
      user_id: user.user_id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
  return [access_token, refresh_token];
};

export default GenerateToken;
