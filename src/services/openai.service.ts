import axios from 'axios';
import config from '../config';
import logger from '../config/logger';

export const generateSummary = async (userActivities: object): Promise<string> => {
  const prompt = `
You are an expert summarizer. Given the following user activities for the past week in JSON format, generate a concise weekly report summarizing what each user did.
User activities:
${JSON.stringify(userActivities, null, 2)}
  `;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 300,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.openai.apiKey}`
        },
      }
    );
    return response.data.choices[0].text.trim();
  } catch (error) {
    logger.error('Error generating summary', error);
    throw error;
  }
};
