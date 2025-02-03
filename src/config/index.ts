import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 3000,
  slack: {
    signingSecret: process.env.SLACK_SIGNING_SECRET as string,
    botToken: process.env.SLACK_BOT_TOKEN as string,
    appToken: process.env.SLACK_APP_TOKEN as string,
    clientId: process.env.CLIENT_ID as string,
    clientSecret: process.env.CLIENT_SECRET as string,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY as string,
  },
  database: {
    url: process.env.DATABASE_URL as string,
  }
};
