import express from "express";
import { signup, login, logout, refreshAuthTokens, getProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/refreshToken", refreshAuthTokens);

router.get("/profile", protectRoute, getProfile)

export default router;