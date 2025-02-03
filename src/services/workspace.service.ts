import db from '../models';
import logger from '../config/logger';

interface WorkspaceData {
  teamId: string;
  accessToken: string;
  botToken: string;
  scope: string;
}

export const upsertWorkspace = async (workspaceData: WorkspaceData) => {
  try {
    const existing = await db.Workspace.findOne({ where: { teamId: workspaceData.teamId } });
    if (existing) {
      await db.Workspace.update(workspaceData, { where: { teamId: workspaceData.teamId } });
      logger.info(`Workspace ${workspaceData.teamId} updated`);
      return existing;
    } else {
      const newWorkspace = await db.Workspace.create(workspaceData);
      logger.info(`Workspace ${workspaceData.teamId} created`);
      return newWorkspace;
    }
  } catch (error) {
    logger.error('Error upserting workspace', error);
    throw error;
  }
};

export const getWorkspace = async (teamId: string) => {
  try {
    const workspace = await db.Workspace.findOne({ where: { teamId } });
    return workspace;
  } catch (error) {
    logger.error('Error fetching workspace', error);
    throw error;
  }
};
