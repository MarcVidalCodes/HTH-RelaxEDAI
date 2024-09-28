import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // Ensure the API key is correctly loaded
});

export const askController = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-4', // Use the correct model name here
    });

    const responseMessage = completion.choices[0].message?.content || 'No response';
    return res.json({ response: responseMessage });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    return res.status(500).json({ error: 'Failed to communicate with OpenAI' });
  }
};