import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai'; 
import { MongoClient, ServerApiVersion } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import mongoose, { Schema, Document } from 'mongoose';
import path from 'path';
import fs from 'fs';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI Client Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // Ensure the API key is correctly loaded
});

// MongoDB Client Configuration
const uri = process.env.MONGO_URI || '';
mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

  mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));


// User Account Schema
interface IUserAccount extends Document {
    email: string;
    password: string;
  }
  
  const UserAccountSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  });
  
  const UserAccount = mongoose.model<IUserAccount>('UserAccount', UserAccountSchema);
  
  // User Information Schema
  interface IUserInfo extends Document {
    user: mongoose.Types.ObjectId;
    pulse: number;
    temperature: number;
  }
  
  const UserInfoSchema: Schema = new Schema({
    user: { type: mongoose.Types.ObjectId, ref: 'UserAccount', required: true },
    pulse: { type: Number, required: true },
    temperature: { type: Number, required: true }
  });
  
  const UserInfo = mongoose.model<IUserInfo>('UserInfo', UserInfoSchema);
  
  export { UserAccount, UserInfo };

// Simulated stress data (replacing stress data)
const stressData = [
  { id: 1, temperature: "36", pulse: "72" },
  { id: 2, temperature: "37", pulse: "78" },
  { id: 3, temperature: "36", pulse: "70" }
];

// Endpoint for user registration
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    try {
      const userAccount = new UserAccount({ email, password: hashedPassword });
      await userAccount.save();
      res.status(201).json({ message: 'User registered successfully', userId: userAccount._id });
    } catch (error) {
      res.status(500).json({ error: 'Failed to register user' });
    }
  });

// Function to Call OpenAI API
async function callOpenAI(prompt: string) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      model: 'gpt-3.5-turbo', 
    });

    return completion.choices[0].message?.content || 'No response';
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    throw new Error('Failed to communicate with OpenAI');
  }
}

// Endpoint to get the stress data
app.get('/api/stress-data', (req, res) => {
  res.json(stressData);
});

// Endpoint to analyze selected stress data
app.post('/api/analyze-stress', async (req, res) => {
  const { stressData } = req.body;

  if (!stressData) {
    return res.status(400).json({ error: 'Stress data is required' });
  }

  const prompt = `You are using this stress data:\n${JSON.stringify(stressData, null, 2)} The user may ask questions or give you some more information regarding their stress metrics. Your task is to analyze the temperature and pulse values to help answer the user's questions. DO NOT just show the user the JSON format, but analyze each item in the JSON to provide meaningful insights.`;

  try {
    const analysis = await callOpenAI(prompt);
    res.json({ analysis });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
