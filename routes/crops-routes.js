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


// new implementation
// Define the route to add user's crop data
router.post("/usercrops", authenticateToken, async (req, res) => {
  try {
    const phone_number = req.user.phone_number;

    const {
      crop_id,
      farm_id,
      area_acres,
      expected_yield_kg,
      sowing_date,
      harvest_date,
      total_harvesting_days,
    } = req.body;

    // Validation for required fields
    if (!crop_id || !farm_id || !area_acres || !expected_yield_kg || !sowing_date || !harvest_date) {
      return res.status(400).json({ error: "All crop fields are required" });
    }

    // Validate and fetch farm's total area
    const farmAreaQuery = `
      SELECT area
      FROM UserFarms
      WHERE farm_id = $1;
    `;
    const farmAreaResult = await pool.query(farmAreaQuery, [farm_id]);

    if (farmAreaResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid farm ID provided" });
    }

    const totalFarmArea = farmAreaResult.rows[0].area;

    // Calculate total area already utilized on the farm by the user for other crops
    const totalAreaUsedQuery = `
      SELECT COALESCE(SUM(area_acres), 0) AS total_used_area
      FROM usercrops
      WHERE farm_id = $1 AND sowing_date = $2;
    `;
    const totalAreaUsedResult = await pool.query(totalAreaUsedQuery, [farm_id, sowing_date]);
    const totalUsedArea = totalAreaUsedResult.rows[0].total_used_area;

    // Calculate the proposed total area after adding the new crop
    const proposedTotalArea = totalUsedArea + area_acres;

    if (area_acres > totalFarmArea) {
      return res.status(400).json({
        error: `Provided area (${area_acres} acres) is greater than the total farm area (${totalFarmArea} acres).`,
      });
    } else if (proposedTotalArea > totalFarmArea) {
      return res.status(400).json({
        error: `Not enough space on the farm. Utilized: ${totalUsedArea} out of ${totalFarmArea} acres. Please consider growing on ${totalFarmArea - totalAreaUsed} acres.`,
      });
    }
    
    // Step 1: Extract the month from the sowing_date
    const sowingMonth = new Date(Date.parse(sowing_date)).toLocaleString('default', { month: 'long' });

    console.log(sowingMonth)

    // Step 2: Calculate the end date of harvesting
    const calculateHarvestEndDate = (harvestDate, totalHarvestingDays) => {
      const startDate = new Date(harvestDate);
      startDate.setDate(startDate.getDate() + totalHarvestingDays);
      const endDate = startDate.toISOString().split('T')[0];
      return endDate;
    };

    const endDate = calculateHarvestEndDate(harvest_date, total_harvesting_days);
    console.log('harvesting started: ', harvest_date)
    console.log('harvesting ended: ', endDate)
    console.log('total days for harvesting: ', total_harvesting_days)

    // Step 3: Calculate total demand
    const demandResult = await pool.query(`
      SELECT c.crop_id, SUM(cd.demand_quantity) AS total_demand
      FROM crop_demand_table cd
      JOIN crops c ON c.crop_id = cd.crop_id
      WHERE cd.gregorian_date BETWEEN $1 AND $2
      GROUP BY c.crop_id;
    `, [harvest_date, endDate]);

    // Extract total demand for specific crop
    const cropDemand = demandResult.rows.find((row) => row.crop_id === crop_id);
    const totalDemand = cropDemand ? cropDemand.total_demand : 0;
    console.log('cropDemand', cropDemand)
    console.log('total demand', totalDemand)

   
   // Step 4: Check supply
const userProvidedSupply = expected_yield_kg * total_harvesting_days;
console.log('userProvidedSupply', userProvidedSupply)

const totalSupplyQuery = `
  SELECT SUM(expected_yield_kg * total_harvesting_days) AS total_supply
  FROM usercrops
  WHERE sowing_date = $1 AND harvest_date = $2 AND crop_id = $3;
`;

const supplyResult = await pool.query(totalSupplyQuery, [
  sowing_date,
  harvest_date,
  crop_id,
]);

// Get the total supply or default to 0 if null
const totalSupplyFromDB = supplyResult.rows[0].total_supply !== null ? parseFloat(supplyResult.rows[0].total_supply) : 0;

const totalSupply = totalSupplyFromDB + parseFloat(userProvidedSupply);
console.log('total supply',totalSupply)

    // Step 5: Save user-provided crop data in UserCrops table
    if (totalSupply < 1.2 * totalDemand) {
      const insertUserCropQuery = `
        INSERT INTO UserCrops (user_id, crop_id, farm_id, area_acres, expected_yield_kg, sowing_date, harvest_date, total_harvesting_days)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING user_crop_id
      `;
      console.log('step 5')

      const insertUserCropResult = await pool.query(insertUserCropQuery, [
        phone_number,
        crop_id,
        farm_id,
        area_acres,
        expected_yield_kg,
        sowing_date,
        harvest_date,
        total_harvesting_days,
      ]);

      const user_crop_id = insertUserCropResult.rows[0].user_crop_id;

      // Fetch all user crops to include the new crop
      const getUserCropsQuery = `
        SELECT user_crop_id, crop_id, farm_id, area_acres, expected_yield_kg, sowing_date, harvest_date, total_harvesting_days
        FROM UserCrops
        WHERE user_id = $1
      `;

      const userCropsResult = await pool.query(getUserCropsQuery, [phone_number]);

      const userCrops = userCropsResult.rows;

      // Send the list of user crops as a response
      res.status(200).json(userCrops);
    } else {
      let  additionalQuantityPerDay = 0
      let  estimatedAreaRequired = 0

      if (totalSupplyFromDB < 0.8 * totalDemand) {
        const additionalQuantityNeeded = 1.1 * totalDemand - totalSupplyFromDB;
      
        // Calculate additional quantity per day
         additionalQuantityPerDay = additionalQuantityNeeded / total_harvesting_days;
      
        // Calculate yield per acre
        const yieldTotal = expected_yield_kg * total_harvesting_days;
      
        // Calculate the quantity that can be grown on 1 acre
        const yieldPerAcre = yieldTotal / area_acres;
      
        // Calculate the estimated area required
        estimatedAreaRequired = additionalQuantityNeeded / yieldPerAcre;
      }

      // Step 6: Suggest alternative crops
      const alternativeCropsQuery = `
        SELECT p.crop_id, c.name
        FROM possible_crops p
        JOIN crops c ON p.crop_id = c.crop_id
        WHERE p.sowing_time ILIKE $1
        AND p.crop_id <> $2;
      `;
    
      const alternativeCropsResult = await pool.query(alternativeCropsQuery, [`%${sowingMonth}%`, crop_id]);
    
      const alternativeCrops = alternativeCropsResult.rows;
    
      if (additionalQuantityPerDay > 0) {
        res.status(200).json({
          recommendation: alternativeCrops,
          additionalQuantityPerDay: additionalQuantityPerDay,
          estimatedAreaRequired: estimatedAreaRequired,
        });
      } else{
        res.status(200).json({ recommendation: alternativeCrops });
      }
    }
    
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
        FROM crops
        ORDER BY name;
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