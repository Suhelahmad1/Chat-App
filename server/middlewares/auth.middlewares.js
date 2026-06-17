import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {
  //  Added req, res, next parameters
  try {
    // 1. Grab the token from headers
    const token = req.headers.token;

    // 2. If token doesn't exist, return an unauthenticated response
    if (!token) {
      return res.json({
        success: false,
        message: "Unauthorized - No Token Provided",
      });
    }

    // 3. Verify the token token integrity
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.json({
        success: false,
        message: "Unauthorized - Invalid Token",
      });
    }

    // 4. Find user using the exact matching payload key (userId)
    // .select("-password") ensures we don't carry the password hash in the request object
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // 5. Attach the authenticated user instance to the request object
    req.user = user;

    // 6. Pass control to the next controller function in line
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    res.json({ success: false, message: "Internal Server Error" });
  }
};
