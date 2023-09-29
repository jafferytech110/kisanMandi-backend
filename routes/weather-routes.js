import express from "express";
import pool from "../db.js"; // Import your database connection pool
import { authenticateToken } from "../middleware/authorization.js"; // Import your authentication middleware

const router = express.Router();

// Define the route to get a list of cities for the authenticated user
router.get("/userCities", authenticateToken, async (req, res) => {
    try {
      // Get the user's phone number from the authentication middleware
      const phone_number = req.user.phone_number;
  
      // Fetch cities from the UserAddresses table for the authenticated user
      const getAddressCitiesQuery = `
        SELECT DISTINCT city
        FROM UserAddresses
        WHERE user_id = $1
      `;
  
      const addressCitiesResult = await pool.query(getAddressCitiesQuery, [phone_number]);
      const addressCities = addressCitiesResult.rows.map((row) => row.city);
  
      // Fetch cities from the UserFarms table for the authenticated user
      const getFarmCitiesQuery = `
        SELECT DISTINCT city
        FROM UserFarms
        WHERE user_id = $1
      `;
  
      const farmCitiesResult = await pool.query(getFarmCitiesQuery, [phone_number]);
      const farmCities = farmCitiesResult.rows.map((row) => row.city);
  
      // Combine the lists of cities from both tables (you may want to handle duplicates if needed)
      const allCities = [...addressCities, ...farmCities];
  
      // Send the list of cities as a response
      res.status(200).json({ cities: allCities });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while fetching city data." });
    }
  });
  
  export default router;