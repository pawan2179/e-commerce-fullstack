import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const storeRefreshToken = async(userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, "EX",7*24*60*60);
}

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, //prevents XSS - cross site scripting
    secure: process.env.NODE_ENV == "production",
    sameSite: "strict", // prevents CSRF - cross site request forgery
    maxAge: 15*60*1000
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
    sameSite: "strict",
    maxAge: 7*24*60*60*1000
  });
}

const generateTokens = (userId) => {
  const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

  return {accessToken, refreshToken};
}

export const signup = async (req, res) => {
  try {
    const {email, password, name } = req.body;
    const user = await User.findOne({email});
  
    if(user) {
      return res.status(400).json({message: "User already exists"});
    }
    const newUser = await User.create({name, email, password});
    
    //authentication
    const { accessToken, refreshToken } = generateTokens(newUser._id);
    await storeRefreshToken(newUser._id, refreshToken);

    //set cookies
    setCookies(res, accessToken, refreshToken);
    res.status(201).json({
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      message: "User created successfully" 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({message: "Something went wrong: ", error});
  }
};

export const login = async (req, res) => {
  try {
    const {email, password} = req.body;
    // console.log(email, "  ,  ", password);
    const user = await User.findOne({email});

    // console.log("User : ", user);

    if(user && (await user.comparePassword(password))) {
      const {accessToken, refreshToken} = generateTokens(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(401).json({message: "Incorrect username or password."});
    }
  } catch (error) {
    console.error("Error in login controller", error);
  }
};

export const logout = async (req, res) => {
  try{
    const refreshToken = req.cookies.refreshToken;
    if(refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully"})
  } catch(err) {
    res.status(500).json({message: "Server error: ", err});
  }
};

export const refreshAuthTokens = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) {
      return res.status(404).json({message: "Refresh token not found. Login again"});
    }
    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decodedToken.userId}`);

    if(storedToken !== refreshToken) {
      return res.status(401).json({message: "Invalid refresh token"});
    }

    const accessToken = jwt.sign({userId: decodedToken.userId}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m"});

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: "strict",
      maxAge: 15*60*1000
    });

    res.status(200).json({message: "Access token created successfully"});

  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Something went wrong."});
  }
}

export const getProfile = (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.log("Something went wrong in getting profile : ", error.message);
    res.status(500).json({message: "Something went wrong"});
  }
}