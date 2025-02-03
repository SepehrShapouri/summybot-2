import OpenAI from "openai";
import config from "../config";
import logger from "../config/logger";
export const generateSummary = async (
  userActivities: object
): Promise<string | undefined> => {
  const openai = new OpenAI({ apiKey: config.openai.apiKey });
  const prompt = `
You are an expert summarizer. Given the following user activities for the past week in JSON format, generate a concise weekly report summarizing what each user did.
User activities:
${JSON.stringify(userActivities, null, 2)}
  `;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Create a weekly summary grouped by user from these Slack messages. 
            For each user, list their key contributions in bullet points. 
            Focus on completed tasks and decisions. Format:
            
            *User Name*
            - Contribution 1
            - Contribution 2
            
            Messages:\n${JSON.stringify(userActivities, null, 2)}`,
        },
      ],
    });
    return completion.choices[0].message.content?.trim();
  } catch (error) {
    logger.error("Error generating summary", error);
    throw error;
  }
};
