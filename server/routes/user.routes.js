import express from "express";
import {
  signup,
  login,
  isAuth,
  updateProfile,
} from "../controllers/user.controlers.js";
import { protectRoute } from "../middlewares/auth.middlewares.js";

const Router = express.Router();

// 🔓 Public Routes (Anyone can access these to authenticate)
Router.post("/signup", signup);
Router.post("/login", login);

// 🔒 Protected Routes (Require a valid token via protectRoute middleware)
Router.get("/is-auth", protectRoute, isAuth);
Router.put("/update-profile", protectRoute, updateProfile);

export default Router;
