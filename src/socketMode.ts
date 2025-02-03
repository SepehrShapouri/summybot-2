import { App } from "@slack/bolt";
import config from "./config";
import * as workspaceService from "./services/workspace.service";
import * as slackService from "./services/slack.service";
import * as openaiService from "./services/openai.service";
import logger from "./config/logger";

const slackApp = new App({
  signingSecret: config.slack.signingSecret,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  stateSecret: "fsdlkf;klj3q4f9sadiokfasd;jf;asdjfklasdf",
  socketMode: true,
  appToken: config.slack.appToken,
});

slackApp.command("/summarize", async ({ ack, body, client }) => {
  await ack();
  try {
    const workspace = await workspaceService.getWorkspace(body.team_id);
    console.log(workspace);
    const botToken = workspace
      ? workspace.get("botToken")
      : config.slack.botToken;
    const slackClient = slackService.getSlackClient(botToken);
    const oneWeekAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    const oldest = oneWeekAgo.toString();
    const history = await slackClient.conversations.history({
      channel: body.channel_id,
      oldest,
      inclusive: true,
      limit: 1000,
    });

    const userActivities: { [user: string]: string[] } = {};
    history.messages?.forEach((message: any) => {
      if (message.user && message.text) {
        if (!userActivities[message.user]) {
          userActivities[message.user] = [];
        }
        userActivities[message.user].push(message.text);
      }
    });

    const summary = await openaiService.generateSummary(userActivities);

    await slackClient.chat.postMessage({
      channel: body.channel_id,
      text: `*Weekly Summary:*\n${summary}`,
    });
  } catch (error) {
    logger.error("Error handling /summarize command", error);
    await client.chat.postMessage({
      channel: body.channel_id,
      text: "Error generating summary. Please try again later.",
    });
  }
});

(async () => {
  await slackApp.start();
  logger.info("Slack Bolt app running in Socket Mode");
})();

export default slackApp;
