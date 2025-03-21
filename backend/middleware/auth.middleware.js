import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async(req, res, next) => {
  try {
    console.log("in protect route");
    const accessToken = req.cookies.accessToken;
    if(!accessToken) {
      return res.status(401).json({message: "No token provided"});
    }
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select("password");
      if(!user) {
        return res.status(401).json({message: "User not found"});
      }
      req.user = user;
      next();
    } catch (error) {
      if(error.name === "TokenExpiredError") {
        return res.status(401).json({message: "Unauthorized, access token expired"});
      }
      throw error;
    }
  } catch (error) {
    // console.log("Error in protectRoute middleware", error.message);
    return res.status(500).json({message: "Something went wrong : ", error: error.message});
  }
}

export const adminRoute = async(req, res, next) => {
  const user = await User.findOne({_id: req.user._id});
  console.log("in admin middleware : ", user);
  if(user && user.role === "admin") next();
  else return res.status(403).json({message: "Access denied: only admin allowed"});
}