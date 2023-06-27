import "dotenv/config.js";
import { MySQLPool } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { errorJSON } from "../utils/loggers.js";
import cypherPassword from "../utils/cypherPassword.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function signUp(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      throw new Error("Username and password are required.");

    const [currentUser] = await MySQLPool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (currentUser.length > 0) {
      throw new Error("User already exists.");
    }

    const passwordHash = await cypherPassword(password);

    const [newUser] = await MySQLPool.query("INSERT INTO users SET ?", [
      { username, password: passwordHash },
    ]);

    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    errorJSON(res, error.message);
  }
}

export async function signIn(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      throw new Error("Username and password are required.");

    const [currentUser] = await MySQLPool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (currentUser.length === 0) {
      throw new Error("Invalid username.");
    }

    const validPassword = await bcrypt.compare(
      password,
      currentUser[0].password
    );

    if (!validPassword) {
      throw new Error("Invalid password.");
    }

    const token = jwt.sign({ id: currentUser[0].id }, JWT_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    res.json({
      message: "User logged in successfully.",
      user: {
        id: currentUser[0].id,
        username: currentUser[0].username,
        token,
      },
    });
  } catch (error) {
    errorJSON(res, error.message);
  }
}

export async function deleteUserByID(req, res) {
  try {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      throw new Error("Task ID must be Int type.");
    }

    const [result] = await MySQLPool.query("DELETE FROM users WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) throw new Error("User not found.");

    res.json({ message: "User successfully deleted." });
  } catch (error) {
    errorJSON(res, error.message);
  }
}

export async function updateUserByID(req, res) {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    if (isNaN(Number(id))) {
      throw new Error("Task ID must be Int type.");
    }

    const [currentUser] = await MySQLPool.query(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (currentUser.length === 0) {
      throw new Error("User not found.");
    }

    const passwordHash = await cypherPassword(password);

    const [result] = await MySQLPool.query(
      "UPDATE users SET username = ?, password = ? WHERE id = ?",
      [username, passwordHash, id]
    );

    res.json({ message: "User updated successfully." });
  } catch (error) {
    error(error.message);
    errorJSON(res, error.message);
  }
}
