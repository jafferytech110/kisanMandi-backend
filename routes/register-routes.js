import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import { jwtTokens } from "../utils/jwt-helpers.js"; // Import your jwtTokens function



let refreshTokens = [];
const router = express.Router();


// Route for user registration
router.post("/", async (req, res) => {
  try {
    const { phone_number, password, first_name, last_name } = req.body;

    // Check if the phone number already exists in the Users table
    const checkPhoneNumberQuery = `
      SELECT * FROM Users WHERE phone_number = $1
    `;

    const existingUser = await pool.query(checkPhoneNumberQuery, [
      phone_number,
    ]);

    if (existingUser.rows.length > 0) {
      // Phone number already exists, throw an error
      return res.status(400).json({ error: "Phone number already exists." });
    }

    // Hash the user's password before storing it in the database, callback function can also be passed if 
    // something wrong occurs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the Users table
    const insertUserQuery = `
      INSERT INTO Users (phone_number, password, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [phone_number, hashedPassword, first_name, last_name];
    const result = await pool.query(insertUserQuery, values);

    // Generate JWT tokens for the newly registered user
    let tokens = jwtTokens(result.rows[0]); // Pass the user data from the result
    res.cookie('refresh_token', tokens.refreshToken, { httpOnly: true });

    // Include phone_number in the response along with tokens and success message
    res.status(201).json({ phone_number: phone_number, ...tokens, success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while registering the user." });
  }
});

export default router;
