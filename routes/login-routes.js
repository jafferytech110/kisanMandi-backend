import express from "express";
import pool from '../db.js'
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import {jwtTokens} from '../utils/jwt-helpers.js'

const router = express.Router()

// Route for user login
router.post('/', async (req, res) => {
    try {
      const { phone_number, password } = req.body;
  
      // Retrieve the user by phone_number
      const findUserQuery = 'SELECT * FROM Users WHERE phone_number = $1';
      const userResult = await pool.query(findUserQuery, [phone_number]);
  
      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }
  
      const user = userResult.rows[0];
  
      // Compare the provided password with the hashed password in the database
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }
  
      // You can generate a JWT token here for user authentication
      let tokens = jwtTokens(userResult)
      res.cookie('refresh_token', tokens.refreshToken,{httpOnly: true})
      res.json(tokens)
      // Return a success message or token
      res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while logging in.' });
    }
  });

  router.get('/refresh_token',(req,res) => {
    try {
      const refreshToken = req.cookies.refresh_token
      if(refreshToken == null) {
        res.status(401).json({error: 'Null Refresh Token'})
      }
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
        if(error) {
          return res.status(403).json({error: error.message})
        }
        let tokens = jwtTokens(user)
        res.cookie('refresh_token', tokens.refreshToken,{httpOnly: true})
        res.json(tokens)
      })
    } catch (error) {
      res.status(401).json({error: error.message})  
    }
  })

  // logging out
  router.delete('/refresh_token',(req,res) => {
    try {
      res.clearCookie('refresh_token')
      return res.status(200).json({message: 'refresh Token Deleted'})
    } catch (error) {
      res.status(401).json({error: error.message})  
    }
  })

export default router