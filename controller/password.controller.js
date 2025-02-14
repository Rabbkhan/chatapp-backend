const UserModel = require("../model/UserModel");
const bcryptjs = require("bcryptjs");
const Jwt = require("jsonwebtoken");

const checkPassword = async (req, res) => {
  try {
    const { password, userId } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found!",
        error: true,
      });
    }

    const verifyPassword = await bcryptjs.compare(password, user.password);
    if (!verifyPassword) {
      return res.status(400).json({
        message: "Please check your password!",
        error: true,
      });
    }

    const tokenData = {
      id: user._id,
      email: user.email,
    };
    const token = Jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    const cookieOption = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure cookie in production
      sameSite: "strict", // Prevent cross-site request forgery
    };

    res.cookie("token", token, cookieOption).status(200).json({
      message: "Login successfully!",
      token,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
    });
  }
};

module.exports = checkPassword;
