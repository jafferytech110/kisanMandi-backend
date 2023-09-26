import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtTokens } from "../utils/jwt-helpers.js";
import { authenticateToken } from "../middleware/authorization.js";

const router = express.Router();

// Route for user login
router.post("/", async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    // Retrieve the user by phone_number
    const findUserQuery = "SELECT * FROM Users WHERE phone_number = $1";
    const userResult = await pool.query(findUserQuery, [phone_number]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // You can generate a JWT token here for user authentication
    let tokens = jwtTokens(user);

    res.cookie("refresh_token", tokens.refreshToken, { httpOnly: true });

    // Return the tokens and a success message in a single response
    res
      .status(200)
      .json({
        phone_number: phone_number,
        ...tokens,
        message: "Login successful",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while logging in." });
  }
});

// logging out
router.delete("/refresh_token", (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.status(200).json({ message: "refresh Token Deleted" });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});


// Refresh access token route
router.get("/refresh", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const refreshToken = authHeader && authHeader.split(" ")[1];

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided." });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (error, user) => {
        if (error) {
          console.error("Refresh token verification error:", error.message);
          return res
            .status(403)
            .json({ error: "Refresh token verification failed." });
        }

        // You can check if the user is still valid (e.g., not banned, active, etc.) here

        // Generate a new access token
        const newAccessToken = jwt.sign(
          { phone_number: user.phone_number },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "1h", // Set the expiration time as needed
          }
        );

        return res.json({ accessToken: newAccessToken });
      }
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while refreshing the access token." });
  }
});

export default router;
