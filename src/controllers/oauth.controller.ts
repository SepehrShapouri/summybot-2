import { Request, Response } from 'express';
import axios from 'axios';
import config from '../config';
import * as workspaceService from '../services/workspace.service';
import logger from '../config/logger';

export const oauthRedirect = async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).send('Missing code parameter');
    return;
  }

  try {
    const response = await axios.get('https://slack.com/api/oauth.v2.access', {
      params: {
        code,
        client_id: config.slack.clientId,
        client_secret: config.slack.clientSecret,
      },
    });

    if (!response.data.ok) {
      logger.error('OAuth error', response.data);
      res.status(400).send(`OAuth Error: ${response.data.error}`);
      return;
    }
    const { team, access_token, scope } = response.data;
    await workspaceService.upsertWorkspace({
      teamId: team.id,
      accessToken: access_token,
      botToken: access_token,
      scope: scope,
    });

    res.send('Installation successful! You can close this window.');
  } catch (error) {
    logger.error('OAuth redirect error', error);
    res.status(500).send('Internal Server Error');
  }
};
