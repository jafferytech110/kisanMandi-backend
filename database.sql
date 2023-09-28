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

-- profile section related tables and modification to current table
CREATE TABLE IF NOT EXISTS UserAddresses (
  address_id SERIAL PRIMARY KEY,
  user_id VARCHAR(15) REFERENCES Users(phone_number),
  address VARCHAR(255),
  city VARCHAR(255),
  province VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- CNIC of user in the users table
ALTER TABLE Users
ADD COLUMN cnic_number VARCHAR(20);

-- Country to user Address
ALTER TABLE UserAddresses
ADD country VARCHAR(255);

-- User's farms table
CREATE TABLE IF NOT EXISTS UserFarms (
  farm_id SERIAL PRIMARY KEY,
  user_id VARCHAR(15) REFERENCES Users(phone_number),
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modify the 'UserFarms' table
ALTER TABLE UserFarms
DROP COLUMN location,
ADD COLUMN address VARCHAR(255),
ADD COLUMN city VARCHAR(255),
ADD COLUMN province VARCHAR(255),
ADD COLUMN country VARCHAR(255),
ADD COLUMN area DECIMAL(20, 2) NOT NULL,
ADD COLUMN latitude DECIMAL(20, 16),
ADD COLUMN longitude DECIMAL(20, 16);

-- Markets table
CREATE TABLE IF NOT EXISTS Markets (
  market_id SERIAL PRIMARY KEY,
  market_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE Markets
ADD COLUMN latitude DECIMAL(20, 16),
ADD COLUMN longitude DECIMAL(20, 16);


-- user's market or markets
CREATE TABLE IF NOT EXISTS UserMarkets (
  user_market_id SERIAL PRIMARY KEY,
  user_id VARCHAR(15) REFERENCES Users(phone_number),
  market_id INT REFERENCES Markets(market_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Add any additional constraints, indexes, or triggers as needed.

--psql -U postgres
--\c kisanmandidb
--\dt

-- End of SQL statements
