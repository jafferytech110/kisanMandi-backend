import pool from "../db.js";
import axios from 'axios';

// Function to convert Gregorian date to Islamic date using the API
async function getIslamicDate(gregorianDate) {
    return new Promise((resolve) => {
        setTimeout(async () => {
          try {
            const response = await axios.get(`http://api.aladhan.com/v1/gToH/${gregorianDate}`);
            resolve(response.data.data.hijri.date);
          } catch (error) {
            console.error('Error converting Gregorian to Islamic date:', error);
            resolve(null);
          }
        }, 1000); // Delay for 1 second (1000 milliseconds)
      });
}

function gregorianToPST(gregorianDate, timezone = "Asia/Karachi") {
    const date = new Date(gregorianDate);
  date.setUTCHours(date.getUTCHours() + 5);
  return new Date(date).toISOString().replace("T", " ");
  }
  // formatting islamic date
  function formatIslamicDate(islamicDate) {
    const [day, month, year] = islamicDate.split("-");
    return `${year}-${month}-${day}`;
  }

// Function to populate the crop_demand table
async function populateCropDemandTable() {
  try {
    const client = await pool.connect();
    
    // Generate random demand quantities
    const randomDemands = [140, 150, 160, 120, 180, 200];
    
    // Loop through crops (assuming crop IDs are from 1 to 29)
    for (let cropId = 1; cropId <= 1; cropId++) {
      let year = 2023;
      for (let day = 1; day <= 365; day++) {
        let month;
        let dayOfMonth;
        if (day <= 31) {
          month = 1; // January
          dayOfMonth = day;
        } else if (day <= 59 + (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 1 : 0)) {
          month = 2; // February
          dayOfMonth = day - 31;
        } else if (day <= 90) {
          month = 3; // March
          dayOfMonth = day - (59 + (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 1 : 0));
        } else if (day <= 120) {
          month = 4; // April
          dayOfMonth = day - 90;
        } else if (day <= 151) {
          month = 5; // May
          dayOfMonth = day - 120;
        } else if (day <= 181) {
          month = 6; // June
          dayOfMonth = day - 150;
        } else if (day <= 212) {
          month = 7; // July
          dayOfMonth = day - 181;
        } else if (day <= 243) {
          month = 8; // August
          dayOfMonth = day - 212;
        } else if (day <= 273) {
          month = 9; // September
          dayOfMonth = day - 243;
        } else if (day <= 304) {
          month = 10; // October
          dayOfMonth = day - 273;
        } else if (day <= 334) {
          month = 11; // November
          dayOfMonth = day - 304;
        } else {
          month = 12; // December
          dayOfMonth = day - 334;
        }

        const gregorianDate = gregorianToPST(`${year}-${String(month).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`);
        
        // Format the date in DD-MM-YYYY
          const formattedDate = `${String(dayOfMonth).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
        // Convert Gregorian date to Islamic date
        const islamicDateReturned = await getIslamicDate(formattedDate);
        const islamicDate = formatIslamicDate(islamicDateReturned)
        // Generate a random demand quantity for the day
        const demandQuantity = randomDemands[Math.floor(Math.random() * randomDemands.length)];
        
        // // Insert the data into the crop_demand table
        // await client.query({
        //   text: 'INSERT INTO crop_demand (crop_id, gregorian_date, islamic_date, demand_quantity) VALUES ($1, $2, $3, $4)',
        //   values: [cropId, gregorianDate, islamicDate, demandQuantity],
        // });
        console.log(`cropID: ${cropId}, english date: ${gregorianDate}, islamid date: ${islamicDate}, quantity: ${demandQuantity}`)
      }
    }
    
    // Release the client back to the pool
    client.release();
    console.log('Data inserted into crop_demand table.');
  } catch (err) {
    console.error('Error inserting data:', err);
  }
}

// Call the function to populate the crop_demand table
populateCropDemandTable();
