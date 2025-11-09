import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(422).json({ message: "Fields are required" });
    }

    const userData = {
      first_name,
      last_name,
      email,
      password,
      auth_provider: "local",
    };

    const isAdmin = userData.email === process.env.ADMIN_EMAIL;

    const existUser = await User.findOne({ where: { email: userData.email } });

    if (existUser || isAdmin) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(userData.password, 10);

    userData.password = hashPassword;

    const newUser = await User.create({
      ...userData,
    });

    const token = generateToken(newUser.user_id);

    res.status(201).json({
      user: {
        user_id: newUser.user_id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        avatar: newUser.avatar,
        about_user: newUser.about_user,
        role: "user",
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error. Error register " + error.message,
    });
  }
};
