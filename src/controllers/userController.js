const User = require("../models/User/user");
const sendMail = require("../utils/sendMail");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const validator = require("validator");
const Wallet = require("../models/Wallet/wallet");

//register
const register = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const { username, email, password } = req.body;
    if (!validator.isEmail(email)) {
      return ErrorHandler("Invalid email format", 400, req, res);
    }
    if (
      !password.match(
        /(?=[A-Za-z0-9@#$%^&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{8,}).*$/
      )
    ) {
      return ErrorHandler(
        "Password must contain atleast one uppercase letter, one special character and one number",
        400,
        req,
        res
      );
    }
    // const user = await User.findOne({ email, username });
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      if (user.username === username) {
        return ErrorHandler("Username already taken", 400, req, res);
      } else {
        return ErrorHandler("User already exists", 400, req, res);
      }
    }
    const newUser = await User.create({
      username,
      email,
      password,
    });
    newUser.save();
    return SuccessHandler("User created successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//request email verification token
const requestEmailToken = async (req, res) => {
  // #swagger.tags = ['user']

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return ErrorHandler("User does not exist", 400, req, res);
    }
    const emailVerificationToken = Math.floor(100000 + Math.random() * 900000);
    const emailVerificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpires = emailVerificationTokenExpires;
    await user.save();
    const message = `Your email verification token is ${emailVerificationToken} and it expires in 10 minutes`;
    const subject = `Email verification token`;
    await sendMail(email, subject, message);
    return SuccessHandler(
      `Email verification token sent to ${email}`,
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//verify email token
const verifyEmail = async (req, res) => {
  // #swagger.tags = ['user']

  try {
    const { email, emailVerificationToken } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }
    if (
      user.emailVerificationToken !== emailVerificationToken ||
      user.emailVerificationTokenExpires < Date.now()
    ) {
      return ErrorHandler("Invalid token", 400, req, res);
    }
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    jwtToken = user.getJWTToken();
    await user.save();
    return SuccessHandler("Email verified successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//login
const login = async (req, res) => {
  // #swagger.tags = ['user']

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return ErrorHandler("User does not exist", req, 400, res);
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ErrorHandler("Invalid credentials", 400, req, res);
    }
    if (!user.emailVerified) {
      return ErrorHandler("Email not verified", 400, req, res);
    }
    jwtToken = user.getJWTToken();
    return SuccessHandler(
      { message: "Logged in successfully", jwtToken, user },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//logout
const logout = async (req, res) => {
  // #swagger.tags = ['user']

  try {
    req.user = null;
    return SuccessHandler("Logged out successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//forgot password
const forgotPassword = async (req, res) => {
  // #swagger.tags = ['user']

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return ErrorHandler("User does not exist", 400, req, res);
    }
    const passwordResetToken = Math.floor(100000 + Math.random() * 900000);
    const passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetToken = passwordResetToken;
    user.passwordResetTokenExpires = passwordResetTokenExpires;
    await user.save();
    const message = `Your password reset token is ${resetPasswordToken} and it expires in 10 minutes`;
    const subject = `Password reset token`;
    await sendMail(email, subject, message);
    return SuccessHandler(`Password reset token sent to ${email}`, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//reset password
const resetPassword = async (req, res) => {
  // #swagger.tags = ['user']

  try {
    const { email, passwordResetToken, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return ErrorHandler("User does not exist", 400, req, res);
    }
    if (
      user.passwordResetToken !== passwordResetToken ||
      user.passwordResetTokenExpires < Date.now()
    ) {
      return ErrorHandler("Invalid token", 400, req, res);
    }
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;
    await user.save();
    return SuccessHandler("Password reset successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//update password
const updatePassword = async (req, res) => {
  // #swagger.tags = ['user']

  try {
    const { currentPassword, newPassword } = req.body;
    if (
      !newPassword.match(
        /(?=[A-Za-z0-9@#$%^&+!=]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%^&+!=])(?=.{8,}).*$/
      )
    ) {
      return ErrorHandler(
        "Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character",
        400,
        req,
        res
      );
    }
    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return ErrorHandler("Invalid credentials", 400, req, res);
    }
    const samePasswords = await user.comparePassword(newPassword);
    if (samePasswords) {
      return ErrorHandler(
        "New password cannot be same as old password",
        400,
        req,
        res
      );
    }
    user.password = newPassword;
    await user.save();
    return SuccessHandler("Password updated successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const createWallet = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const { accountBalance, savingsAmount, cashInHand } = req.body;
    const isWallet = await Wallet.findOne({ user: req.user._id });
    if (isWallet) {
      return ErrorHandler("Wallet already Exist", 404, req, res);
    }

    if (
      isNaN(accountBalance) ||
      typeof accountBalance !== "number" ||
      isNaN(savingsAmount) ||
      typeof savingsAmount !== "number" ||
      isNaN(cashInHand) ||
      typeof cashInHand !== "number"
    ) {
      return ErrorHandler("Enter valid amount", 400, req, res);
    }

    const data = await Wallet.create({
      user: req.user._id,
      accountBalance,
      savingsAmount,
      cashInHand,
    });
    if (data) {
      await Wallet.findOneAndUpdate(
        { _id: data._id, user: req.user._id },
        {
          $set: {
            isCreated: true,
          },
        }
      );
    }
    return SuccessHandler({ message: "Wallet Created", data }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const getWallet = async (req, res) => {
  // #swagger.tags = ['user']

  try {
    const data = await Wallet.findOne({ user: req.user._id });
    return SuccessHandler({ message: "Wallet fetched", data: data }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  register,
  requestEmailToken,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  createWallet,
  getWallet,
};
