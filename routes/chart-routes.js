// Import required modules
import express from "express";
import pool from "../db.js"; // Import your database connection pool

const router = express.Router();

// Define the route to get crop prices for a specific crop and date range
router.get("/crop-prices", async (req, res) => {
  try {
    const { crop_id, start_date, end_date } = req.query;

    // Ensure crop_id and date range are provided
    if (!crop_id || !start_date || !end_date) {
      return res
        .status(400)
        .json({ error: "Crop ID, start date, and end date are required." });
    }

    // Create a SQL query to fetch crop prices for the specified crop and date range
    const getCropPricesQuery = `
    SELECT date, price
    FROM daily_crop_prices
    WHERE crop_id = $1
    AND date >= $2
AND date <= $3
    ORDER BY date;
    `;

    // Execute the SQL query to fetch crop prices
    const cropPricesResult = await pool.query(getCropPricesQuery, [
      crop_id,
      start_date,
      end_date,
    ]);

    // Extract the crop prices from the query result
    const cropPrices = cropPricesResult.rows;

    // Send the crop prices as a response
    res.status(200).json(cropPrices);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching crop prices." });
  }
});

export default router;

