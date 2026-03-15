const jwt = require("jsonwebtoken");
const { User } = require("../database/user");
const bcrypt = require("bcrypt");
const { RefreshToken } = require("../database/refreshTokens");
require("dotenv").config();
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !password) {
      return res
        .status(401)
        .json({ message: "username and password required" });
    }
    if (password.length < 8) {
      return res
        .status(403)
        .json({ message: "password must be at least 8 characters" });
    }
    if (!typeof password === "string") {
      return res.status(401).json({ message: "password must contain letters" });
    }

    const user = await User.findOne({ where: { username: username } });
    console.log(user);
    if (user) {
      return res.status(401).json({ message: "user already registered" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({
      username: username,
      email: email,
      hashedPassword: hashedPassword,
      city: req.body.city,
      street: req.body.street,
      apartment: req.body.apartment,
      phone: req.body.phone,
      country: req.body.country,
      zip: req.body.zip,
      isAdmin: req.body.isAdmin,
    });

    const saveingUser = newUser.save();

    if (!saveingUser) {
      return res.status(500).json({ message: "user not registered" });
    }

    res.status(200).json({
      message: "user registered successfully",
      newUser,
    });
  } catch (error) {
    res.status(500).json({ message: "internal server error", error });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ message: "email and password required" });
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }

    const isMatch = bcrypt.compareSync(password, user.hashedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "incorrect email or password" });
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
      },
      ACCESS_TOKEN,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
      },
      REFRESH_TOKEN,
      { expiresIn: "7d" },
    );

    const hashedRefreshToken = bcrypt.hashSync(refreshToken, 10);
    const newRefreshToken = new RefreshToken({
      refreshToken: hashedRefreshToken,
      token_id: user.id,
    });
    const storingRefreshToken = newRefreshToken.save();
    if (!storingRefreshToken) {
      return res.status(500).json({ message: "refresh token was not stored" });
    }

    res.status(200).json({
      message: "logged in successfully",
      accesstoken: accessToken,
      refreshtoken: refreshToken,
    });
  } catch (err) {
    res.status(500).json({ message: "internal server error", err });
  }
};

exports.refresh = async (req, res) => {
  const { refreshtoken } = req.body;
  if (!refreshtoken) {
    return res.status(400).json({ message: "refresh token required" });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshtoken, REFRESH_TOKEN);
  } catch (err) {
    return res.status(401).json({ error: "access denied" });
  }
  const stored = await RefreshToken.findOne({ token_id: decoded.id });
  if (!stored) {
    return res.status(401).json({ message: "user not found" });
  }
  const validToken = bcrypt.compareSync(refreshtoken, stored.refreshToken);
  if (!validToken) {
    return res.status(401).json({ message: "invalid token" });
  }

  const newRefreshToken = jwt.sign(
    {
      id: decoded.id,
    },
    REFRESH_TOKEN,
    { expiresIn: "7d" },
  );

  const hashedRefreshToken = bcrypt.hashSync(newRefreshToken, 10);

  await RefreshToken.findOneAndDelete({ token_id: decoded.id });
  let storingRefreshToken = new RefreshToken({
    refreshToken: hashedRefreshToken,
    token_id: decoded.id,
  });

  const savedRefreshToken = await storingRefreshToken.save();

  if (!savedRefreshToken) {
    return res.status(500).json({ message: "refresh token not stored" });
  }

  res.status(200).json({
    message: "refresh token is saved successfully",
    refreshtoken: newRefreshToken,
  });
};

exports.logout = async (req, res) => {
  try {
    const { refreshtoken } = req.body;
    if (!refreshtoken) {
      return res.status(400).json({ message: " logged out" });
    }
    let decoded;
    try {
      decoded = jwt.verify(refreshtoken, REFRESH_TOKEN);
    } catch (err) {
      return res.status(401).json({ message: "logged out" });
    }
    await RefreshToken.findOneAndDelete({ token_id: decoded.id });
    res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "internal server error", error });
  }
};
