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

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;


// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Replace with your frontend's origin
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
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

// Middleware for authentication
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Token received:', token);  // Log the token to verify its structure

  if (token == null) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET || '', (err: any, user: any) => {
    if (err) {
      console.error('JWT verification error:', err);  // Log the verification error
      return res.status(403).json({ error: 'Token is invalid or expired' });
    }
    req.body.userId = user.id;
    next();
  });
};


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

// Endpoint for user login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await UserAccount.findOne({ email });

  if (user && await bcrypt.compare(password, user.password)) {
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || '', { expiresIn: '1h' });
    
    // Save the access token and user ID to the .env file
    const envFilePath = path.join(__dirname, '../.env');

    try {
      // Read the current content of the .env file
      let envData = fs.readFileSync(envFilePath, 'utf8');
      
      // Update or add ACCESS_TOKEN and USER_ID in the .env file
      const tokenRegex = /ACCESS_TOKEN=.*/;
      const userIdRegex = /USER_ID=.*/;

      // Update ACCESS_TOKEN if it exists, otherwise add it
      if (tokenRegex.test(envData)) {
        envData = envData.replace(tokenRegex, `ACCESS_TOKEN=${accessToken}`);
      } else {
        envData += `ACCESS_TOKEN=${accessToken}\n`;
      }

      // Update USER_ID if it exists, otherwise add it
      if (userIdRegex.test(envData)) {
        envData = envData.replace(userIdRegex, `USER_ID=${user._id}`);
      } else {
        envData += `USER_ID=${user._id}\n`;
      }

      // Write the updated content back to the .env file
      fs.writeFileSync(envFilePath, envData);
      console.log(`Access token and user ID saved to .env file: ${accessToken}, ${user._id}`);
    } catch (error) {
      console.error('Error reading/writing to .env file:', error);
    }

    // Send token and user info as a response
    res.json({ accessToken, user: { email: user.email } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Endpoint to add user information
app.post('/api/user-info', authenticateToken, async (req, res) => {
  const { pulse, temperature } = req.body;
  const userId = req.body.userId;

  if (!pulse || !temperature) {
    return res.status(400).json({ error: 'Pulse and temperature are required' });
  }

  try {
    const userInfo = new UserInfo({ user: userId, pulse, temperature });
    await userInfo.save();
    res.status(201).json({ message: 'User information added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add user information' });
  }
});

app.post('/api/stress-data', authenticateToken, async (req, res) => {
  const { user, pulse, temperature } = req.body;

  if (!user || !pulse || !temperature) {
    return res.status(400).json({ error: 'Missing required fields', receivedData: req.body });
  }

  try {
    const newStressData = new UserInfo({
      user,
      pulse,
      temperature
    });

    await newStressData.save();
    res.status(201).json(newStressData);
  } catch (error: unknown) { // Explicitly typing error as unknown
    if (error instanceof Error) { // Type guard to check if error is an instance of Error
      console.error('Error saving stress data:', error.message); // Log the error message
      res.status(500).json({ error: 'Failed to save stress data', details: error.message });
    } else {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'Failed to save stress data', details: 'An unexpected error occurred' });
    }
  }
});


// Existing endpoint to fetch stress data
app.get('/api/stress-data', authenticateToken, async (req, res) => {
  const userId = req.body.userId; // Ensure userId is properly set

  try {
    const stressData = await UserInfo.find({ user: userId }); // Fetch stress data for the user
    res.status(200).json(stressData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stress data' });
  }
});

// Function to Call OpenAI API
async function callOpenAI(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'ft:gpt-3.5-turbo-0125:personal::A7oftNTz',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ]
    });

    return response.choices[0]?.message?.content || 'No response';
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    throw new Error('Failed to communicate with OpenAI');
  }
}


// Endpoint to analyze selected stress data
app.post('/api/analyze-stress', authenticateToken, async (req, res) => {
  const { stressData, question } = req.body;

  if (!stressData || !question) {
    return res.status(400).json({ error: 'Stress data and question are required' });
  }

  const prompt = `You are using this stress data:\n${JSON.stringify(stressData, null, 2)}\n\nThe user has asked the following question: '${question}'. After answering the question, prompt the user to share some more info about their stress for further conversation`;

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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
