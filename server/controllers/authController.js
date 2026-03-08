import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { config } from "../config.js";

const ACCESS_EXPIRY = "15m";

const normalizeEmail = (email) => email.trim().toLowerCase();

const generateRefreshToken = () =>
  crypto.randomBytes(32).toString("hex");

const generateAccessToken = (userId) =>
  jwt.sign({ userId }, config.jwtSecret, { expiresIn: ACCESS_EXPIRY });

const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
});

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const normalizedEmail = normalizeEmail(email);

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const refreshToken = generateRefreshToken();

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      refreshToken,
    });

    const token = generateAccessToken(user._id);

    return res.status(201).json({
      user: formatUser(user),
      token,
      refreshToken,
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Registration failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const refreshToken = generateRefreshToken();
    await User.updateOne({ _id: user._id }, { refreshToken });

    const token = generateAccessToken(user._id);

    return res.json({
      user: formatUser(user),
      token,
      refreshToken,
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
}

export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const newRefreshToken = generateRefreshToken();
    await User.updateOne({ _id: user._id }, { refreshToken: newRefreshToken });

    const token = generateAccessToken(user._id);

    return res.json({
      token,
      refreshToken: newRefreshToken,
    });

  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ error: "Refresh failed" });
  }
}