import { App, Installation } from "@slack/bolt";
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
  installationStore: {
    storeInstallation: async (installation) => {
      if (
        installation.isEnterpriseInstall &&
        installation.enterprise !== undefined
      ) {
        throw new Error("Enterprise installation not supported");
      }
      if (installation.team !== undefined) {
        await workspaceService.upsertWorkspace({
          teamId: installation.team.id,
          accessToken: installation.bot?.token ?? "",
          botToken: installation.bot?.token ?? "",
          scope: installation.bot?.scopes?.join(",") ?? "",
        });
      }
    },
    fetchInstallation: async (installQuery) => {
      if (
        installQuery.isEnterpriseInstall &&
        installQuery.enterpriseId !== undefined
      ) {
        throw new Error("Enterprise installation not supported");
      }
      if (installQuery.teamId !== undefined) {
        const workspace = await workspaceService.getWorkspace(
          installQuery.teamId
        );
        if (!workspace) {
          throw new Error("No matching workspace found");
        }
        
        const installation: Installation<"v2", false> = {
          team: { id: workspace.get("teamId") },
          enterprise: undefined,
          user: {
            token: undefined,
            scopes: [] as string[],
            id: workspace.get("teamId"),
          },
          bot: {
            scopes: workspace.get("scope").split(","),
            token: workspace.get("botToken"),
            userId: "B" + workspace.get("teamId").substring(1), // Create a bot user ID
            id: "B" + workspace.get("teamId").substring(1), // Same as userId
          },
          tokenType: "bot",
          isEnterpriseInstall: false,
          appId: "A" + workspace.get("teamId").substring(1), // Create an app ID
        };

        return installation;
      }
      throw new Error("Failed fetching installation");
    },
    deleteInstallation: async (installQuery) => {
      // Optional: Implement if workspace deletion is needed
    },
  },
});

slackApp.command("/summarize", async ({ ack, body, client }) => {
  await ack({
    response_type: "ephemeral",
    text: ":hourglass: Generating weekly report...",
  });
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
    const userCache = new Map();
    const userIds = [
      ...new Set(
        history.messages?.filter((msg) => msg.user).map((msg) => msg.user)
      ),
    ];
    const userActivities: { [user: string]: string[] } = {};
    await Promise.all(
      userIds.map(async (userId, index) => {
        await new Promise((resolve) => setTimeout(resolve, index + 100));

        try {
          const userInfo = await slackClient.users.info({ user: userId! });
          userCache.set(
            userId,
            userInfo.user?.real_name || userInfo.user?.name
          );
        } catch (error) {
            console.log(error,'error fetching user data')
          userCache.set(userId, `User ${userId?.substring(0, 6)}`);
        }
      })
    );

    history.messages?.forEach((message: (typeof history.messages)[0]) => {
      if (!message.user || message.subtype || message.bot_id) return;
      const username = userCache.get(message.user);
      userActivities[username] = [
        ...(userActivities[username] || []),
        ...(message.text || ""),
      ];
    });
    const activityText = Object.entries(userActivities)
      .map(([user, msg]) => `${user}:\n${msg.join("\n")}`)
      .join("\n\n");
    const summary = await openaiService.generateSummary(activityText);

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
