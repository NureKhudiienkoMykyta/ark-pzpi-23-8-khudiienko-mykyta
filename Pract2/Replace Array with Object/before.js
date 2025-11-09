import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";

export const register = async (req, res) => {
  try {
    const userData = [
      req.body.first_name,
      req.body.last_name,
      req.body.email,
      req.body.password,
      "local",
    ];

    if (!userData[0] || !userData[1] || !userData[2] || !userData[3]) {
      return res.status(422).json({ message: "Fields are required" });
    }

    const isAdmin = userData[2] === process.env.ADMIN_EMAIL;

    const existUser = await User.findOne({ where: { email: userData[2] } });

    if (existUser || isAdmin) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(userData[3], 10);

    userData[3] = hashPassword;

    const newUser = await User.create({
      first_name: userData[0],
      last_name: userData[1],
      email: userData[2],
      password: userData[3],
      auth_provider: userData[4],
    });

    const token = generateToken(newUser.user_id);

    res.status(201).json({
      user: {
        user_id: newUser.user_id,
        first_name: userData[0],
        last_name: userData[1],
        email: userData[2],
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
