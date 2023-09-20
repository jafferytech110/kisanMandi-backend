import express from "express";
import pool from '../db.js';
import bcrypt from 'bcrypt';
import { authenticateToken } from "../middleware/authorization.js";

const router = express.Router();

// authenticating users only can see this
router.get('/', authenticateToken, async (req, res) => {
  try {
    res.json({users: 'someUser'})
  } catch (error) {
    res.status(500).json({error: error.message})
  }
})

// Route for user registration
router.post('/', async (req, res) => {
  try {
    const { phone_number, password, first_name, last_name } = req.body;

    // Check if the phone number already exists in the Users table
    const checkPhoneNumberQuery = `
      SELECT * FROM Users WHERE phone_number = $1
    `;

    const existingUser = await pool.query(checkPhoneNumberQuery, [phone_number]);

    if (existingUser.rows.length > 0) {
      // Phone number already exists, throw an error
      return res.status(400).json({ error: 'Phone number already exists.' });
    }

    // Hash the user's password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the Users table
    const insertUserQuery = `
      INSERT INTO Users (phone_number, password, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [phone_number, hashedPassword, first_name, last_name];
    const result = await pool.query(insertUserQuery, values);

    // Return the newly registered user
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while registering the user.' });
  }
});

export default router;
