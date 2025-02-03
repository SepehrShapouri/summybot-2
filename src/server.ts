import app from './app';
import db from './models';
import config from './config';
import logger from './config/logger';

db.sequelize.authenticate()
  .then(() => {
    logger.info('Database connected');
    return db.sequelize.sync();
  })
  .then(() => {
    const port = config.port;
    app.listen(port, () => {
      logger.info(`Express server running on port ${port}`);
    });
  })
  .catch((err: Error) => {
    logger.error('Database connection error', err);
  });

// Start Slack Socket Mode app (its module bootstraps itself)
import './socketMode';
