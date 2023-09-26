// profile-routes.js
import express from "express";
import pool from "../db.js"; // Import your database connection pool
import { authenticateToken } from "../middleware/authorization.js"; // Import your authentication middleware

const router = express.Router();

// Define the route to get the user's first name and last name
router.get("/fullname", authenticateToken, async (req, res) => {
  try {
    // Get the user's phone number from the authentication middleware
    const phone_number = req.user.phone_number;

    // Fetch the user's first name and last name from the database
    const getUserInfoQuery =
      "SELECT first_name, last_name FROM Users WHERE phone_number = $1";
    const userInfoResult = await pool.query(getUserInfoQuery, [phone_number]);

    if (userInfoResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const { first_name, last_name } = userInfoResult.rows[0];

    // Send the user's first name and last name as a response
    res.status(200).json({ first_name, last_name });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user profile data." });
  }
});

// Define the route to check if CNIC number is provided
router.get("/checkcnic", authenticateToken, async (req, res) => {
  try {
    // Get the user's phone number from the authentication middleware
    const phone_number = req.user.phone_number;

    // Fetch the user's CNIC number from the database
    const getCnicQuery =
      "SELECT cnic_number FROM Users WHERE phone_number = $1";
    const cnicResult = await pool.query(getCnicQuery, [phone_number]);

    if (cnicResult.rows.length === 0) {
      return res.status(404).json({ error: "CNIC not found" });
    }

    const cnic_number = cnicResult.rows[0].cnic_number;

    // Send the user's CNIC number as a response
    res.status(200).json({ cnic_number });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while checking CNIC number." });
  }
});

// Define the route to enter the user's CNIC number
router.post("/cnic", authenticateToken, async (req, res) => {
    try {
      // Get the user's phone number from the authentication middleware
      const phone_number = req.user.phone_number;
  
      // Get the CNIC number from the request body
      const { cnic_number } = req.body;
  
      // Validate the CNIC to allow numbers only
      if (!/^[0-9]+$/.test(cnic_number)) {
        return res.status(400).json({ error: "Invalid CNIC format" });
      }
  
      // Check if the provided CNIC matches any saved user's CNIC
      const checkCnicQuery = "SELECT cnic_number FROM Users WHERE cnic_number = $1";
      const cnicCheckResult = await pool.query(checkCnicQuery, [cnic_number]);
  
      if (cnicCheckResult.rows.length > 0) {
        return res.status(400).json({ error: "CNIC number already exists" });
      }
  
      // Update the user's CNIC number in the database
      const updateCnicQuery =
        "UPDATE Users SET cnic_number = $1 WHERE phone_number = $2";
      await pool.query(updateCnicQuery, [cnic_number, phone_number]);
  
      res.status(200).json({ message: "CNIC number updated successfully", cnic_number });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while updating CNIC number." });
    }
  });
  

export default router;
