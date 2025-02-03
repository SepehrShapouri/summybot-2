import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import oauthRoutes from './routes/oauth.routes';
import config from './config';
import logger from './config/logger';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  const installUrl = `https://slack.com/oauth/v2/authorize?client_id=${config.slack.clientId}&scope=commands,channels:history,chat:write,channels:read,users:read`;
  res.send(`<html>
    <body>
      <h2>Install the Slack App</h2>
      <a href="${installUrl}">Install</a>
    </body>
  </html>`);
});

app.use('/', oauthRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', err);
  res.status(500).send('Internal Server Error');
});

export default app;
