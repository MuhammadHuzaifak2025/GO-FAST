import { v2 as cloudinary } from "cloudinary";
import exp from "constants";
import fs from "fs";

const uploadoncloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) {
      return null;
    }
    cloudinary.config({
      cloud_name: process.env.CLOUDNAME,
      api_key: process.env.CLOUDAPIKEY,
      api_secret: process.env.CLOUDSECRETKEY,
    });

    const resp = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    if (resp) console.log("File Uploaded");
    fs.unlinkSync(localfilepath);

    return resp;
  } catch (error) {
    fs.unlinkSync(localfilepath);
    console.log("Error Uploding File: Error Message: ", error);
    return null;
  }
};

export default uploadoncloudinary;
