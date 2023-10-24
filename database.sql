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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modifying Crops Table

-- Add new columns to the Crops table
ALTER TABLE Crops
ADD COLUMN country VARCHAR(255),
ADD COLUMN province VARCHAR(255),
ADD COLUMN sowing_time JSONB,
ADD COLUMN harvest_time JSONB;

-- modifying
ALTER TABLE Crops
ALTER COLUMN name TYPE VARCHAR(255);

ALTER TABLE Crops
DROP CONSTRAINT IF EXISTS crops_name_key;

ALTER TABLE Crops
ADD COLUMN roman_urdu_name VARCHAR(255),
ADD COLUMN urdu_name VARCHAR(255) COLLATE "ur_IN";

-- Change the data type of sowing_time and harvest_time columns to VARCHAR(200)
ALTER TABLE crops
ALTER COLUMN sowing_time TYPE VARCHAR(200),
ALTER COLUMN harvest_time TYPE VARCHAR(200);



-- -- Create the User_Crops table (Many-to-Many Relationship)
-- CREATE TABLE IF NOT EXISTS User_Crops (
--   user_crop_id SERIAL PRIMARY KEY,
--   user_id VARCHAR(15) REFERENCES Users(phone_number),
--   crop_id INT REFERENCES Crops(crop_id),
--   quantity INT,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );


------------------------------------------------------
-- THIS TABLE WILL BE USED--
------------------------------------------------------
-- Modify the 'User_Crops' table
CREATE TABLE IF NOT EXISTS UserCrops (
  user_crop_id SERIAL PRIMARY KEY,
  user_id VARCHAR(15) REFERENCES Users(phone_number),
  crop_id INT REFERENCES Crops(crop_id),
  farm_id INT REFERENCES UserFarms(farm_id), -- Reference to UserFarms
  area_acres DECIMAL(20, 2) NOT NULL, -- Area in acres
  expected_yield_kg DECIMAL(20, 2) NOT NULL, -- Expected yield in kilograms
  sowing_date DATE, -- Date to sow the crop
  harvest_date DATE, -- Date to harvest the crop
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adding new Column to 'UserCrops' Table
ALTER TABLE UserCrops
ADD COLUMN total_harvesting_days DECIMAL(20, 2);

-- Create a new table to manage the relationship between UserCrops and Markets
CREATE TABLE IF NOT EXISTS UserCropsMarkets (
  user_crop_id INT REFERENCES UserCrops(user_crop_id),
  market_id INT REFERENCES Markets(market_id),
  PRIMARY KEY (user_crop_id, market_id)
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

-- Data Input



INSERT INTO crops (name, description, province, country, sowing_time, harvest_time, average_yield_per_acre, roman_urdu_name, urdu_name)
VALUES
  ('Arum', 'It is a perennial herbaceous plant which is grown in tropical and subtropical regions. It requires warm season for its growth.', 'Sindh, Punjab', 'Pakistan', 'February to March', '180-200 days', 'N/A', 'Arvi', 'اروی'),
  ('Bitter Gourd', 'This herbaceous, tendril-bearing vine grows up to 5 m (16 ft) in length. It bears simple, alternate leaves 4–12 cm (1.6–4.7 in) across, with three to seven deeply separated lobes. Each plant bears separate yellow male and female flowers. In the Northern Hemisphere, flowering occurs during June to July and fruiting during September to November. It is a frost-tender annual in the temperate zone and a perennial in the tropics. It grows best in the USDA zones 9 to 11.', 'Sindh, Punjab', 'Pakistan', 'February to March, June to July', 'N/A', 'N/A', 'Karela', 'کریلہ'),
  ('Bottle Gourd', 'Calabash, also known as bottle gourd, white-flowered gourd, long melon, birdhouse gourd, New Guinea bean, Tasmania bean, and opo squash, is a vine grown for its fruit.', 'Sindh, Punjab', 'Pakistan', 'March to October', 'N/A', 'N/A', 'Kaddu', 'کدو'),
  ('Brinjal', 'Eggplant, aubergine, brinjal, or baigan is a plant species in the nightshade family Solanaceae. Solanum melongena is grown worldwide for its edible fruit. Most commonly purple, the spongy, absorbent fruit is used in several cuisines. Typically used as a vegetable in cooking, it is a berry by botanical definition', 'Sindh, Punjab', 'Pakistan', 'February to March, June, November', '60 -70 days', 'N/A', 'Bengan', 'بینگن'),
  ('Cabbage', 'Cabbage, comprising several cultivars of Brassica oleracea, is a leafy green, red, or white biennial plant grown as an annual vegetable crop for its dense-leaved heads.', 'Sindh, Punjab', 'Pakistan', 'August to November', '60-100 days', 'N/A', 'Band Gobi', 'بند گوبھی'),
  ('Capsicum', 'Capsicum, also known as red pepper or chili pepper, is an herb. Its fruit is commonly applied to the skin for arthritis pain and other conditions.', 'Sindh, Punjab', 'Pakistan', 'October-November, February', '50-60 days', 'N/A', 'Shimla Mirch', 'شملہ مرچ'),
  ('Carrot', 'The carrot is a root vegetable, typically orange in color, though heirloom variants include purple, black, red, white, and yellow cultivars exist, all of which are domesticated forms of the wild carrot, Daucus carota, native to Europe and Southwestern Asia.', 'Sindh, Punjab', 'Pakistan', 'September-October', '60-80 days', 'N/A', 'Gajar', 'گاجر'),
  ('Cauliflower', 'Cauliflower is one of several vegetables in the species Brassica oleracea in the genus Brassica, which is in the Brassicaceae family. It is an annual plant that reproduces by seed. Typically, only the head is eaten – the edible white flesh is sometimes called "curd".', 'Sindh, Punjab', 'Pakistan', 'June-October', '60-80 days', 'N/A', 'Phool Gobi', 'پھول گوبھی'),
  ('Coriander', 'Coriander, also known as cilantro, is an annual herb in the family Apiaceae. All parts of the plant are edible, but the fresh leaves and the dried seeds are the parts most traditionally used in cooking', 'Sindh, Punjab', 'Pakistan', 'July-November, February-April', '45-50 days', 'N/A', 'Dhania', 'دھنیا'),
  ('Cucumber', 'The cucumber is a widely-cultivated creeping vine plant in the family Cucurbitaceae that bears cylindrical to spherical fruits, which are used as culinary vegetables. Considered an annual plant, there are three main types of cucumber—slicing, pickling, and seedless—within which several cultivars have been created.', 'Sindh, Punjab', 'Pakistan', 'Feb-July', '50-70 days', 'N/A', 'Kheera', ' کھیرا'),
  ('Fenugreek', 'It is an annual plant in the family Fabaceae, with leaves consisting of three small obovate to oblong leaflets. It is cultivated worldwide as a semiarid crop. Its seeds and leaves are common ingredients in dishes from the Indian subcontinent, and have been used as a culinary ingredient since ancient times.', 'Sindh, Punjab', 'Pakistan', 'N/A', 'N/A', 'N/A', 'Methi', ' میتھی'),
  ('Garlic', 'Garlic is a species of bulbous flowering plant in the genus Allium. Its close relatives include the onion, shallot, leek, chive, Welsh onion, and Chinese onion.', 'Sindh, Punjab', 'Pakistan', 'September-October', 'N/A', 'N/A', 'Lehsan', 'لہسن'),
  ('Ginger', 'Ginger is a flowering plant whose rhizome, ginger root or ginger, is widely used as a spice and a folk medicine. It is a herbaceous perennial which grows annual pseudostems about one meter tall, bearing narrow leaf blades.', 'Sindh, Punjab', 'Pakistan', 'February-March', 'N/A', 'N/A', 'Adrak', ' ادرک'),
  ('Hot Pepper', 'Chili peppers, from Nahuatl chīlli, are varieties of the berry-fruit of plants from the genus Capsicum, which are members of the nightshade family Solanaceae, cultivated for their pungency. Chili peppers are widely used in many cuisines as a spice to add "heat" to dishes.', 'Sindh, Punjab', 'Pakistan', 'September-October, Februaury', 'N/A', 'N/A', 'Mirch', 'مرچ'),
  ('Lettuce', 'Lettuce is an annual plant of the family Asteraceae. It is most often grown as a leaf vegetable, but sometimes for its stem and seeds. Lettuce is most often used for salads, although it is also seen in other kinds of food, such as soups, sandwiches and wraps; it can also be grilled.', 'Sindh, Punjab', 'Pakistan', 'September-October', 'N/A', 'N/A', 'Salad Patta', 'سلاد پتہ'),
  ('Mint', 'It  is a genus of plants in the family Lamiaceae. The exact distinction between species is unclear; it is estimated that 13 to 24 species exist. Hybridization occurs naturally where some species ranges overlap. Many hybrids and cultivars are known', 'Sindh, Punjab', 'Pakistan', 'July-November, February-April', '45-50 days', 'N/A', 'Podina', 'پودینہ'),
  ('Mustard', 'Mustard is a condiment made from the seeds of a mustard plant. The whole, ground, cracked, or bruised mustard seeds are mixed with water, vinegar, lemon juice, wine, or other liquids, salt, and often other flavorings and spices, to create a paste or sauce ranging in color from bright yellow to dark brown.', 'Sindh, Punjab', 'Pakistan', 'September-October', 'N/A', 'N/A', 'Sarso', 'سرسوں'),
  ('Okra', 'Okra, Abelmoschus esculentus, known in some English-speaking countries as lady fingers, is a flowering plant in the mallow family. It has edible green seed pods. The geographical origin of okra is disputed, with supporters of West African, Ethiopian, Southeast Asian, and South Asian origins', 'Sindh, Punjab', 'Pakistan', 'February-March, June-July', '70-90 days', 'N/A', 'Bhindi', 'بھنڈی'),
  ('Onion', 'An onion, also known as the bulb onion or common onion, is a vegetable that is the most widely cultivated species of the genus Allium. The shallot is a botanical variety of the onion which was classified as a separate species until 2011. Its close relatives include garlic, scallion, leek, and chive', 'Sindh, Punjab', 'Pakistan', 'February-March, September-October', '150-180 days', 'N/A', 'Piyaz', 'پیاز'),
  ('Peas', 'The pea is most commonly the small spherical seed or the seed-pod of the flowering plant species Lathyrus oleraceus. Each pod contains several peas, which can be green or yellow. Botanically, pea pods are fruit, since they contain seeds and develop from the ovary of a flower.', 'Sindh, Punjab', 'Pakistan', 'September-November', '50-75 days', 'N/A', 'Matar', ' مٹر'),
  ('Potato', 'potato, (Solanum tuberosum), annual plant in the nightshade family (Solanaceae), grown for its starchy edible tubers.', 'Sindh, Punjab', 'Pakistan', 'February-March, September-October', '110-150 days', 'N/A', 'Aaloo', 'آلو'),
  ('Radish', 'The radish is an edible root vegetable of the family Brassicaceae that was domesticated in Asia prior to Roman times. Radishes are grown and consumed throughout the world, being mostly raw as a crunchy salad vegetable with a pungent, slightly spicy flavor, varying in intensity depending on its growing environmen', 'Sindh, Punjab', 'Pakistan', 'July-November, February-March', '30-60 days', 'N/A', 'Moli', ' مولی'),
  ('Spinach', 'Spinach is a leafy green flowering plant native to central and Western Asia. It is of the order Caryophyllales, family Amaranthaceae, subfamily Chenopodioideae. Its leaves are a common edible vegetable consumed either fresh, or after storage using preservation techniques by canning, freezing, or dehydration', 'Sindh, Punjab', 'Pakistan', 'June-November', '50-80 days', 'N/A', 'Palak', 'پالک'),
  ('Sponge gourd', 'The Sponge gourd is a cylindrical fruit that grows on a climbing, herbaceous vine. It has a smooth, green skin when young, and may feature ridges or ridge lines that run across the skin of the fruit. The Sponge gourd grows up to 60 centimeters long, but is harvested as a vegetable when it is young and tender, at around 12 centimeters in length. The Sponge gourd contains many seeds, which can be around 1.5 centimeters in length. The seeds are also edible but are usually removed before the flesh is eaten. The interior flesh of the Sponge gourd is smooth and creamy-white. Sponge gourd has a mild, zucchini-like sweet taste and a silky texture. Mature fruits are not tasty, being fibrous, bitter and brown.', 'Sindh, Punjab', 'Pakistan', 'February-April, June-July', '60-70 days', 'N/A', 'Tori', 'توری'),
  ('Sweet Potato', 'The sweet potato or sweetpotato is a dicotyledonous plant that belongs to the bindweed or morning glory family, Convolvulaceae. Its large, starchy, sweet-tasting tuberous roots are used as a root vegetable. The young shoots and leaves are sometimes eaten as greens', 'Sindh, Punjab', 'Pakistan', 'February-March', '140-150 days', 'N/A', 'Shakar Qandi', 'شکر قندی'),
  ('Tinda gourd', 'Praecitrullus fistulosus, commonly known as Tinda, also called Indian squash, round melon, Indian round gourd or apple gourd or Indian baby pumpkin, is a squash-like cucurbit grown for its immature fruit, a vegetable especially popular in South Asia. It is the only member of the genus Praecitrullus.', 'Sindh, Punjab', 'Pakistan', 'March-April, June-July', '50-60 days', 'N/A', 'Tinda', 'ٹینڈا'),
  ('Tomato', 'A member of the nightshade family (along with aubergines, peppers and chillies), tomatoes are in fact a fruit, but their affinity for other savoury ingredients means that they are usually classed as a vegetable.', 'Sindh, Punjab', 'Pakistan', 'February-March, September-November', '60-70 days', 'N/A', 'Timatar', 'ٹماٹر'),
  ('Tumeric', 'a bright yellow aromatic powder obtained from the rhizome of a plant of the ginger family, used for flavouring and colouring in Asian cooking and formerly as a fabric dye.', 'Sindh, Punjab', 'Pakistan', 'March-April, June-July', 'N/A', 'N/A', 'Haldi', 'ہلدی'),
  ('Turnip', 'The turnip or white turnip is a root vegetable commonly grown in temperate climates worldwide for its white, fleshy taproot. The word turnip is a compound of turn as in turned/rounded on a lathe and neep, derived from Latin napus, the word for the plant.', 'Sindh, Punjab', 'Pakistan', 'August to November', '60-90 days', 'N/A', 'Shaljam', 'شلجم');
  -- Add more rows here
  ;
-- Create the Daily Crop Prices table
CREATE TABLE IF NOT EXISTS daily_crop_prices (
    id SERIAL PRIMARY KEY,
    crop_id INT REFERENCES Crops(crop_id),  -- Reference to your crops table
    price NUMERIC,  -- The price of the crop
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_crop_prices_utc (
    id SERIAL PRIMARY KEY,
    crop_id INT REFERENCES Crops(crop_id),  -- Reference to your crops table
    price NUMERIC,  -- The price of the crop
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO daily_crop_prices_utc (crop_id, price, date)
SELECT crop_id, price, date AT TIME ZONE 'Europe/London' AT TIME ZONE 'UTC'
FROM daily_crop_prices;

-- First, drop the existing daily_crop_prices table
DROP TABLE IF EXISTS daily_crop_prices;

-- Next, rename the daily_crop_prices_utc table to daily_crop_prices
ALTER TABLE daily_crop_prices_utc RENAME TO daily_crop_prices;






-- Add any additional constraints, indexes, or triggers as needed.

--psql -U postgres
--\c kisanmandidb
--\dt

-- End of SQL statements
