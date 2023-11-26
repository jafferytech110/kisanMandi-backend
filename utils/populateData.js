import pool from "../db.js";
// import axios from 'axios';

// // Function to convert Gregorian date to Islamic date using the API
// async function getIslamicDate(gregorianDate) {
//     return new Promise((resolve) => {
//         setTimeout(async () => {
//             try {
//                 const response = await axios.get(`http://api.aladhan.com/v1/gToH/${gregorianDate}`);
//                 resolve(response.data.data.hijri.date);
//             } catch (error) {
//                 console.error('Error converting Gregorian to Islamic date:', error);
//                 resolve(null);
//             }
//         }, 1000); // Delay for 1 second (1000 milliseconds)
//     });
// }

// // Function to format Islamic date as "YYYY-MM-DD"
// function formatIslamicDate(islamicDate) {
//     const [day, month, year] = islamicDate.split("-");
//      // Check if it's a leap year in the Islamic calendar
//      const isLeapYear = (year * 1 - 1) % 30 === 0;
//      // Check if the month is greater than 12 and the day is greater than 29 (for leap years)
//      if (month > 12 || (isLeapYear && day > 29) || (!isLeapYear && day > 30)) {
//          // Handle the day and month overflow
//          const adjustedYear = year * 1 + Math.floor(month / 13);
//          const adjustedMonth = month % 12 || 12;
//          const adjustedDay = day % (isLeapYear ? 30 : 29) || (isLeapYear ? 30 : 29);
//          return `${adjustedYear}-${adjustedMonth.toString().padStart(2, '0')}-${adjustedDay.toString().padStart(2, '0')}`;
//      }
//      return `${year}-${month}-${day}`;
// }


function gregorianToPST(gregorianDate, timezone = "Asia/Karachi") {
    const date = new Date(gregorianDate);
    date.setUTCHours(date.getUTCHours() + 5);
    return new Date(date).toISOString().replace("T", " ");
}

// Function to get the number of days in a month
function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

// Function to check if a record with the same crop ID, Gregorian date, and Islamic date exists
async function isRecordExists(client, cropId, gregorianDate) {
    const result = await client.query({
        text: 'SELECT COUNT(*) FROM crop_demand_table WHERE crop_id = $1 AND gregorian_date = $2',
        values: [cropId, gregorianDate],
    });
    return result.rows[0].count > 0;
}

// Function to populate the crop_demand table
async function populateCropDemandTable() {
    try {
        const client = await pool.connect();

        // Generate random demand quantities
        const randomDemands = [140, 150, 160, 120, 180, 200];

        // Loop through crops (assuming crop IDs are from 1 to 29)
        for (let cropId = 1; cropId <= 29; cropId++) {
            let year = 2024;
            let dayOfYear = 1; // Initialize the day of the year

            for (let day = 1; day <= 365; day++) {
                // Calculate the month and day of the month
                let month = 1; // Initialize to January
                let dayOfMonth = dayOfYear;

                // Update month and dayOfMonth based on the day of the year
                while (dayOfMonth > getDaysInMonth(year, month)) {
                    dayOfMonth -= getDaysInMonth(year, month);
                    month++;
                }

                // Increment the day of the year
                dayOfYear++;

                const gregorianDate = gregorianToPST(`${year}-${String(month).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`);

                // // Format the date in DD-MM-YYYY
                // const formattedDate = `${String(dayOfMonth).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
                // // Convert Gregorian date to Islamic date
                // const islamicDateReturned = await getIslamicDate(formattedDate);
                // const islamicDate = formatIslamicDate(islamicDateReturned);

                // Generate a random demand quantity for the day
                const demandQuantity = randomDemands[Math.floor(Math.random() * randomDemands.length)] || 120;
                console.log(`cropID: ${cropId}, english date: ${gregorianDate}, quantity: ${demandQuantity}`);
                
                // Check if the record already exists in the database
                const recordExists = await isRecordExists(client, cropId, gregorianDate);

                if (!recordExists) {
                    console.log(`Inserting data - cropID: ${cropId}, english date: ${gregorianDate}, quantity: ${demandQuantity}`);
                    // Insert the data into the crop_demand table
                    await client.query({
                        text: 'INSERT INTO crop_demand_table (crop_id, gregorian_date, demand_quantity) VALUES ($1, $2, $3)',
                        values: [cropId, gregorianDate, demandQuantity],
                    });
                } else {
                    console.log(`Skipping data - cropID: ${cropId}, english date: ${gregorianDate}`);
                }
                
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
