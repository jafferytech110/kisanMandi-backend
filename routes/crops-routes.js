// profile-routes.js
import express from "express";
import pool from "../db.js"; // Import your database connection pool
import { authenticateToken } from "../middleware/authorization.js"; // Import your authentication middleware

const router = express.Router();

// Define the route to get user's crop data
router.get("/usercrops", authenticateToken, async (req, res) => {
  try {
    // Get the user's phone number from the authentication middleware
    const phone_number = req.user.phone_number;

    // Create a SQL query to fetch the user's crop data
    const getUserCropsQuery = `
      SELECT user_crop_id, crop_id, farm_id, area_acres, expected_yield_kg, sowing_date, harvest_date
      FROM UserCrops
      WHERE user_id = $1
    `;

    // Execute the SQL query to fetch the user's crop data
    const userCropsResult = await pool.query(getUserCropsQuery, [phone_number]);

    // Extract the crop data from the query result
    const userCrops = userCropsResult.rows;

    // Check if any crop data was found
    if (userCrops.length === 0) {
      // Return an empty array with a 404 status
      return res.status(404).json([]);
    }

    // Send the user's crop data as a response with a 200 status
    res.status(200).json(userCrops);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user crop data." });
  }
});



// Define the route to add user's crop data
router.post("/usercrops", authenticateToken, async (req, res) => {
  try {
    // Get the user's phone number from the authenticated user object
    const phone_number = req.user.phone_number;

    // Get crop data from the request body
    const {
      crop_id,
      farm_id,
      area_acres,
      expected_yield_kg,
      sowing_date,
      harvest_date,
      total_harvesting_days, // New column
    } = req.body;

    // Validate that required fields are provided and not empty
    if (
      !crop_id ||
      !farm_id ||
      !area_acres ||
      !expected_yield_kg ||
      !sowing_date ||
      !harvest_date
    ) {
      return res.status(400).json({ error: "All crop fields are required" });
    }

    // Insert the new user crop data into the UserCrops table, including the new column
    const insertUserCropQuery = `
      INSERT INTO UserCrops (user_id, crop_id, farm_id, area_acres, expected_yield_kg, sowing_date, harvest_date, total_harvesting_days)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING user_crop_id
    `;

    const insertUserCropResult = await pool.query(insertUserCropQuery, [
      phone_number,
      crop_id,
      farm_id,
      area_acres,
      expected_yield_kg,
      sowing_date,
      harvest_date,
      total_harvesting_days, // New column value
    ]);

    const user_crop_id = insertUserCropResult.rows[0].user_crop_id;

    // Fetch all user crops to include the new crop
    const getUserCropsQuery = `
      SELECT user_crop_id, crop_id, farm_id, area_acres, expected_yield_kg, sowing_date, harvest_date, total_harvesting_days
      FROM UserCrops
      WHERE user_id = $1
    `;

    const userCropsResult = await pool.query(getUserCropsQuery, [phone_number]);

    // Extract the user crops from the query result
    const userCrops = userCropsResult.rows;

    // Send the list of user crops as a response
    res.status(200).json(userCrops);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while adding user crop data",
    });
  }
});

// Define a route to get a list of crop names and IDs
router.get("/cropnames", async (req, res) => {
    try {
      // Create a SQL query to fetch crop names and IDs from the crops table
      const getCropNamesQuery = `
        SELECT crop_id, name
        FROM crops;
      `;
  
      // Execute the SQL query to fetch crop names and IDs
      const cropNamesResult = await pool.query(getCropNamesQuery);
  
      // Extract the crop names and IDs from the query result
      const cropNames = cropNamesResult.rows;
  
      // Send the list of crop names and IDs as a response
      res.status(200).json(cropNames);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while fetching crop names" });
    }
  });


  export default router;