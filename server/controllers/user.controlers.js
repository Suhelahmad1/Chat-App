import { generateToken } from "../lib/utils.js";
import User from "../models/user.models.js";
import bcrypt from "bcrypt";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.json({
        success: false,
        message: "This email is already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    // Generate token and attach it to a secure cookie
    const token = generateToken(newUser._id);

    res.json({
      success: true,
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic || "",
      },
      token, // Optional: You can still send it here if your frontend uses local storage alongside cookies
      message: "Account created Successfully",
    });
  } catch (error) {
    console.error("Error in signup controller:", error.message);
    res.json({ success: false, message: "Internal Server Error" });
  }
};

// LOGIN CONTROLLER
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Validation: Check if email and password are provided
    if (!email || !password) {
      return res.json({ success: false, message: "All fields are required" });
    }

    // 2. Check Database: Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    // 3. Password Verification: Compare plain text input with hashed DB password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    // 4. Token Generation: Generate JWT token using your utility function
    const token = generateToken(user._id);

    // 5. Response: Send back successful payload without sensitive password data
    res.json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic || "",
        bio: user.bio || "",
      },
      token,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Error in login controller:", error.message);
    res.json({ success: false, message: "Internal Server Error" });
  }
};

// Controller to check if the user is authenticated
export const isAuth = (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    console.error("Error in isAuth controller:", error.message);
    res.json({ success: false, message: "Internal Server Error" });
  }
};

// Controller to update user profile details
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user?._id; // Safety check for auth middleware

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: User ID missing" });
    }

    // Validation: Check if at least something was passed to update
    if (!fullName && !bio && !profilePic) {
      return res.json({
        success: false,
        message: "No data provided to update",
      });
    }

    // Dynamic object banao takki undefined values DB me na jayein
    let updatedFields = {};
    if (fullName !== undefined) updatedFields.fullName = fullName;
    if (bio !== undefined) updatedFields.bio = bio;

    // If a new profile picture string (base64) is provided, upload to Cloudinary
    if (profilePic) {
      console.log("Uploading image to Cloudinary...");
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "profile_pics", // Optional: Cloudinary me ek folder ban jayega
      });

      // Storing the secure HTTPS URL into our update object
      updatedFields.profilePic = uploadResponse.secure_url;
    }

    // One single DB call handles both conditions perfectly
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true }, // Returns the newly updated document
    ).select("-password"); // Hide password hash

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Ensure a response is sent back
    return res.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    // Is log ko dhyan se terminal me dekhna agar ab bhi crash ho!
    console.error("Error in updateProfile controller:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
