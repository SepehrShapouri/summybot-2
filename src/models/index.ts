import { Sequelize } from 'sequelize';
import config from '../config';

const sequelize = new Sequelize(config.database.url, {
  dialect: 'postgres',
  logging: false,
});

const db: any = { sequelize, Sequelize };

import WorkspaceFactory from './workspace.model'
db.Workspace = WorkspaceFactory(sequelize, Sequelize);

export default db;
