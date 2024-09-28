import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

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

// Simulated fall data
const fallData = [
  { id: 1, time: "14:30", speed: "3.5 meters per second", distance: "10 meters" },
  { id: 2, time: "10:15", speed: "4.2 meters per second", distance: "12 meters" },
  { id: 3, time: "18:00", speed: "3.0 meters per second", distance: "8 meters" }
];

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

app.get('/api/fall-data', (req, res) => {
    res.json(fallData);
  });

  
// Endpoint to analyze selected fall data
app.post('/api/analyze-fall', async (req, res) => {
    const { fall } = req.body;
  
    if (!fall) {
      return res.status(400).json({ error: 'Fall data is required' });
    }
  
    const prompt = `You are using this data:\n${JSON.stringify(fall, null, 2)} The user may ask questions or give you some more information, on their fall, yoru task is to answer questions and help them. DO NOT just show the user the json format but analyze each item in the json to help answer the users questions`;
  
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