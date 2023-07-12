import "dotenv/config.js";
import { MySQLPool } from "../db.js";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import bcrypt from "bcryptjs";
import { errorJSON } from "../utils/loggers.js";
import cypherPassword from "../utils/cypherPassword.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function signUp(req, res) {
  try {
    const { username, password } = req.body;
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword)
      throw new Error("Username and password are required");

    const [currentUser] = await MySQLPool.query(
      "SELECT * FROM users WHERE username = ?",
      [trimmedUsername]
    );

    if (currentUser.length > 0) {
      throw new Error("User already exists");
    }

    const passwordHash = await cypherPassword(trimmedPassword);

    const [newUser] = await MySQLPool.query("INSERT INTO users SET ?", [
      { username: trimmedUsername, password: passwordHash },
    ]);

    const token = jwt.sign({ user: trimmedUsername }, JWT_SECRET, {
      expiresIn: "30d",
    });

    const serializedToken = serialize("jwtToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    res.set("Set-Cookie", serializedToken);
    res.status(201).json({
      message: "User signed up successfully",
      user: trimmedUsername,
    });
  } catch (error) {
    errorJSON(res, error.message);
  }
}

export async function signIn(req, res) {
  try {
    const { username, password } = req.body;
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword)
      throw new Error("Username and password are required");

    const [currentUser] = await MySQLPool.query(
      "SELECT * FROM users WHERE username = ?",
      [trimmedUsername]
    );

    if (currentUser.length === 0) {
      throw new Error("Invalid username");
    }

    const validPassword = await bcrypt.compare(
      trimmedPassword,
      currentUser[0].password
    );

    if (!validPassword) {
      throw new Error("Invalid password");
    }

    const token = jwt.sign({ user: currentUser[0].username }, JWT_SECRET, {
      expiresIn: "30d",
    });

    const serializedToken = serialize("jwtToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    res.set("Set-Cookie", serializedToken);
    res.json({
      message: "User signed in successfully",
      user: currentUser[0].username,
    });
  } catch (error) {
    errorJSON(res, error.message);
  }
}

export async function deleteUserByID(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      throw new Error("Task ID must be Int type");
    }

    const [result] = await MySQLPool.query("DELETE FROM users WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) throw new Error("User not found");

    res.json({ message: "User successfully deleted" });
  } catch (error) {
    errorJSON(res, error.message);
  }
}

export async function updateUserByID(req, res) {
  try {
    const { id } = req.params;
    const { username, password } = req.body;
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (isNaN(Number(id))) {
      throw new Error("Task ID must be Int type");
    }

    const [currentUser] = await MySQLPool.query(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (currentUser.length === 0) {
      throw new Error("User not found");
    }

    const passwordHash = await cypherPassword(trimmedPassword);

    const [result] = await MySQLPool.query(
      "UPDATE users SET username = ?, password = ? WHERE id = ?",
      [trimmedUsername, passwordHash, id]
    );

    res.json({ message: "User updated successfully" });
  } catch (error) {
    error(error.message);
    errorJSON(res, error.message);
  }
}
