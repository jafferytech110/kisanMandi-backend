// profile-routes.js
import express from "express";
import pool from "../db.js"; // Import your database connection pool
import { authenticateToken } from "../middleware/authorization.js"; // Import your authentication middleware

const router = express.Router();

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

    // Format the full name with the first letter of both first_name and last_name capitalized
    const formattedFullName = `${capitalizeFirstLetter(first_name)} ${capitalizeFirstLetter(last_name)}`;

    res.status(200).json({ full_name: formattedFullName });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user profile data." });
  }
});

// Function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


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
    const checkCnicQuery =
      "SELECT cnic_number FROM Users WHERE cnic_number = $1";
    const cnicCheckResult = await pool.query(checkCnicQuery, [cnic_number]);

    if (cnicCheckResult.rows.length > 0) {
      return res.status(400).json({ error: "CNIC number already exists" });
    }

    // Update the user's CNIC number in the database
    const updateCnicQuery =
      "UPDATE Users SET cnic_number = $1 WHERE phone_number = $2";
    await pool.query(updateCnicQuery, [cnic_number, phone_number]);

    res
      .status(200)
      .json({ message: "CNIC number updated successfully", cnic_number });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating CNIC number." });
  }
});

// Define the route to get the user's home address
router.get("/userHomeAddress", authenticateToken, async (req, res) => {
  try {
    // Get the user's phone number from the authentication middleware
    const phone_number = req.user.phone_number;

    // Create a SQL query to fetch the user's address details
    const getAddressQuery =
      "SELECT address, city, province, country FROM UserAddresses WHERE user_id = $1";

    // Execute the SQL query to fetch the address details
    const addressResult = await pool.query(getAddressQuery, [phone_number]);

    // Check if any address details were returned
    if (addressResult.rows.length === 0) {
      return res.status(404).json({ error: "Address not found" });
    }

    // Extract the address details from the query result
    const { address, city, province, country } = addressResult.rows[0];

    // Send the user's address details as a response
    res.status(200).json({ address, city, province, country });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user address data." });
  }
});

// Define the route to add/update user's home address
router.post("/userHomeAddress", authenticateToken, async (req, res) => {
  try {
    // Get the user's phone number from the authenticated user object
    const phone_number = req.user.phone_number;

    // Get the address data from the request body
    const { address, city, province, country } = req.body;

    // Check if an address already exists for the user
    const checkAddressQuery =
      "SELECT address_id FROM UserAddresses WHERE user_id = $1";
    const checkAddressResult = await pool.query(checkAddressQuery, [
      phone_number,
    ]);

    if (checkAddressResult.rows.length > 0) {
      // Address exists, update it
      const updateAddressQuery =
        "UPDATE UserAddresses SET address = $1, city = $2, province = $3, country = $4 WHERE user_id = $5";
      await pool.query(updateAddressQuery, [
        address,
        city,
        province,
        country,
        phone_number,
      ]);
    } else {
      // Address doesn't exist, insert a new record
      const insertAddressQuery =
        "INSERT INTO UserAddresses (user_id, address, city, province, country) VALUES ($1, $2, $3, $4, $5)";
      await pool.query(insertAddressQuery, [
        phone_number,
        address,
        city,
        province,
        country,
      ]);
    }

    res.status(200).json({ message: "User address updated successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating user address." });
  }
});

// Define the route to get the user's chosen market(s)
router.get("/usermarkets", authenticateToken, async (req, res) => {
  try {
    // Get the user's phone number from the authentication middleware
    const phone_number = req.user.phone_number;

    // Create a SQL query to fetch the user's chosen market(s)
    const getUserMarketsQuery = `
        SELECT Markets.market_name, Markets.location
        FROM UserMarkets
        INNER JOIN Markets ON UserMarkets.market_id = Markets.market_id
        WHERE UserMarkets.user_id = $1
      `;

    // Execute the SQL query to fetch the user's chosen market(s)
    const userMarketsResult = await pool.query(getUserMarketsQuery, [
      phone_number,
    ]);

    // Check if any market(s) were returned
    if (userMarketsResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No chosen markets found for the user" });
    }

    // Extract the market(s) details from the query result
    const userMarkets = userMarketsResult.rows;

    // Send the user's chosen market(s) as a response
    res.status(200).json(userMarkets);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "An error occurred while fetching user's chosen markets.",
      });
  }
});

// Define the route to allow users to post their chosen market
router.post("/usermarkets", authenticateToken, async (req, res) => {
    try {
      // Get the user's phone number from the authenticated user object
      const phone_number = req.user.phone_number;
  
      // Get the market name from the request body
      const { market_name } = req.body;
  
      // Validate that market_name is provided and not empty
      if (!market_name) {
        return res.status(400).json({ error: "Market name is required" });
      }
  
      // Check if the provided market name already exists in the UserMarkets table for the user
      const checkUserMarketQuery = `
        SELECT UserMarkets.user_market_id
        FROM UserMarkets
        INNER JOIN Markets ON UserMarkets.market_id = Markets.market_id
        WHERE UserMarkets.user_id = $1 AND Markets.market_name = $2
      `;
  
      const userMarketResult = await pool.query(checkUserMarketQuery, [
        phone_number,
        market_name,
      ]);
  
      if (userMarketResult.rows.length === 0) {
        // If the market name doesn't exist for the user, insert it
        // First, check if the market name exists in the Markets table
        const checkMarketQuery =
          "SELECT market_id FROM Markets WHERE market_name = $1";
        const marketResult = await pool.query(checkMarketQuery, [market_name]);
  
        if (marketResult.rows.length === 0) {
          // If the market name doesn't exist in the Markets table, insert it
          const insertMarketQuery =
            "INSERT INTO Markets (market_name) VALUES ($1) RETURNING market_id";
          const insertMarketResult = await pool.query(insertMarketQuery, [
            market_name,
          ]);
  
          const market_id = insertMarketResult.rows[0].market_id;
  
          // Insert new user-market association
          const insertUserMarketQuery =
            "INSERT INTO UserMarkets (user_id, market_id) VALUES ($1, $2)";
          await pool.query(insertUserMarketQuery, [phone_number, market_id]);
        } else {
          // If the market name already exists in the Markets table, get its market_id
          const market_id = marketResult.rows[0].market_id;
  
          // Insert new user-market association
          const insertUserMarketQuery =
            "INSERT INTO UserMarkets (user_id, market_id) VALUES ($1, $2)";
          await pool.query(insertUserMarketQuery, [phone_number, market_id]);
        }
      }
  
      // Fetch the user's chosen markets using a SQL query
      const getUserMarketsQuery = `
        SELECT Markets.market_name, Markets.location
        FROM UserMarkets
        INNER JOIN Markets ON UserMarkets.market_id = Markets.market_id
        WHERE UserMarkets.user_id = $1
      `;
  
      const userMarketsResult = await pool.query(getUserMarketsQuery, [
        phone_number,
      ]);
  
      // Extract the list of chosen markets
      const userMarkets = userMarketsResult.rows;
  
      // Respond with only the user's chosen markets
      res.status(200).json(userMarkets);
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while updating chosen market" });
    }
  });
  

// Define the route to get the list of all markets
router.get("/markets", async (req, res) => {
  try {
    // Fetch the list of all markets from the database
    const getAllMarketsQuery = "SELECT market_name FROM Markets";
    const marketsResult = await pool.query(getAllMarketsQuery);

    // Extract the market names from the query result
    const markets = marketsResult.rows.map((row) => row.market_name);

    // Send the list of markets as a response
    res.status(200).json({ markets });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the list of markets." });
  }
});

// Define the route to get all user farms
router.get("/userFarms", authenticateToken, async (req, res) => {
  try {
    // Get the user's phone number from the authentication middleware
    const phone_number = req.user.phone_number;

    // Create a SQL query to fetch all user farms for the given user
    const getUserFarmsQuery = `
      SELECT farm_id, address, city, province, country, area, latitude, longitude
      FROM UserFarms
      WHERE user_id = $1
    `;

    // Execute the SQL query to fetch all user farms
    const userFarmsResult = await pool.query(getUserFarmsQuery, [phone_number]);

    // Check if any user farms were found
    if (userFarmsResult.rows.length === 0) {
      return res.status(404).json({ error: "You do not have any farm in your database, please add a new farm." });
    }

    // Extract the user farms from the query result
    const userFarms = userFarmsResult.rows;

    // Send the user's farms as a response
    res.status(200).json(userFarms);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user farms." });
  }
});

// Define the route to add a new user farm
router.post("/userFarms", authenticateToken, async (req, res) => {
  try {
    // Get the user's phone number from the authenticated user object
    const phone_number = req.user.phone_number;

    // Get farm data from the request body
    const { area, address, city, province, country, latitude, longitude } = req.body;

    // Validate that the "area" is provided and not empty
    if (!area) {
      return res.status(400).json({ error: "Farm area is required" });
    }

    // Insert the new user farm into the UserFarms table
    const insertFarmQuery = `
      INSERT INTO UserFarms (user_id, area, address, city, province, country, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING farm_id
    `;

    const insertFarmResult = await pool.query(insertFarmQuery, [
      phone_number,
      area,
      address,
      city,
      province,
      country,
      latitude,
      longitude
    ]);

    const farm_id = insertFarmResult.rows[0].farm_id;

    // Fetch all user farms to include the new farm
    const getUserFarmsQuery = `
      SELECT farm_id, area, address, city, province, country, latitude, longitude
      FROM UserFarms
      WHERE user_id = $1
    `;

    const userFarmsResult = await pool.query(getUserFarmsQuery, [phone_number]);

    // Extract the user farms from the query result
    const userFarms = userFarmsResult.rows;

    // Send the list of user farms as a response
    res.status(200).json(userFarms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding user farm" });
  }
});

// Define the route to edit a user farm
router.put("/userFarms/:farmId", authenticateToken, async (req, res) => {
  try {
    // Get the user's phone number from the authenticated user object
    const phone_number = req.user.phone_number;

    // Get the farm ID from the route parameters
    const farmId = req.params.farmId;

    // Get farm data from the request body
    const { area, address, city, province, country, latitude, longitude } = req.body;

    // Validate that the "area" is provided and not empty
    if (!area) {
      return res.status(400).json({ error: "Farm area is required" });
    }

    // Check if the farm with the provided farm ID belongs to the user
    const checkFarmOwnershipQuery = `
      SELECT farm_id FROM UserFarms
      WHERE user_id = $1 AND farm_id = $2
    `;

    const farmOwnershipResult = await pool.query(checkFarmOwnershipQuery, [
      phone_number,
      farmId,
    ]);

    if (farmOwnershipResult.rows.length === 0) {
      return res.status(403).json({ error: "You do not have permission to edit this farm" });
    }

    // Update the user farm in the UserFarms table
    const updateFarmQuery = `
      UPDATE UserFarms
      SET area = $1, address = $2, city = $3, province = $4, country = $5, latitude = $6, longitude = $7
      WHERE farm_id = $8
    `;

    await pool.query(updateFarmQuery, [
      area,
      address,
      city,
      province,
      country,
      latitude,
      longitude,
      farmId,
    ]);

    // Fetch all user farms after the update
    const getUserFarmsQuery = `
      SELECT farm_id, area, address, city, province, country, latitude, longitude
      FROM UserFarms
      WHERE user_id = $1
    `;

    const userFarmsResult = await pool.query(getUserFarmsQuery, [phone_number]);

    // Extract the user farms from the query result
    const userFarms = userFarmsResult.rows;

    // Send the list of user farms as a response
    res.status(200).json(userFarms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while editing user farm" });
  }
});

// Define the route to delete a user farm by farm ID
router.delete("/userFarms/:farmId", authenticateToken, async (req, res) => {
  try {
    // Get the user's phone number from the authenticated user object
    const phone_number = req.user.phone_number;

    // Get the farm ID from the route parameters
    const farmId = req.params.farmId;

    // Check if the farm with the provided farm ID belongs to the user
    const checkFarmOwnershipQuery = `
      SELECT farm_id FROM UserFarms
      WHERE user_id = $1 AND farm_id = $2
    `;

    const farmOwnershipResult = await pool.query(checkFarmOwnershipQuery, [
      phone_number,
      farmId,
    ]);

    if (farmOwnershipResult.rows.length === 0) {
      return res.status(403).json({ error: "You do not have permission to delete this farm" });
    }

    // Delete the user farm from the UserFarms table
    const deleteFarmQuery = `
      DELETE FROM UserFarms
      WHERE farm_id = $1
    `;

    await pool.query(deleteFarmQuery, [farmId]);

    // Fetch all user farms after the delete operation
    const getUserFarmsQuery = `
      SELECT farm_id, area, address, city, province, country, latitude, longitude
      FROM UserFarms
      WHERE user_id = $1
    `;

    const userFarmsResult = await pool.query(getUserFarmsQuery, [phone_number]);

    // Extract the user farms from the query result
    const userFarms = userFarmsResult.rows;

    if (userFarms.length === 0) {
      return res.status(404).json({ error: "You do not have any farms in your database. Please add a farm." });
    }

    // Send the list of user farms as a response after deleting the farm
    res.status(200).json(userFarms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while deleting user farm" });
  }
});



export default router;
