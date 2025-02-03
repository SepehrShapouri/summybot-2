import { WebClient } from '@slack/web-api';

export const getSlackClient = (botToken: string): WebClient => {
  return new WebClient(botToken);
};
