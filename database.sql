CREATE DATABASE kisanmandidb;

-- Create the Users table
CREATE TABLE Users (
  phone_number VARCHAR(15) PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the Crops table
CREATE TABLE IF NOT EXISTS Crops (
  crop_id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the User_Crops table (Many-to-Many Relationship)
CREATE TABLE IF NOT EXISTS User_Crops (
  user_crop_id SERIAL PRIMARY KEY,
  user_id VARCHAR(15) REFERENCES Users(phone_number),
  crop_id INT REFERENCES Crops(crop_id),
  quantity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the Notifications table
CREATE TABLE IF NOT EXISTS Notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id VARCHAR(15) REFERENCES Users(phone_number),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add any additional constraints, indexes, or triggers as needed.

--psql -U postgres
--\c kisanmandidb
--\dt

-- End of SQL statements
