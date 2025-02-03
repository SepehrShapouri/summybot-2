import { DataTypes, Sequelize, Model, Optional } from 'sequelize';

interface WorkspaceAttributes {
  teamId: string;
  accessToken: string;
  botToken: string;
  scope: string;
  installedAt?: Date;
}

interface WorkspaceCreationAttributes extends Optional<WorkspaceAttributes, 'installedAt'> {}

class Workspace extends Model<WorkspaceAttributes, WorkspaceCreationAttributes> implements WorkspaceAttributes {
  public teamId!: string;
  public accessToken!: string;
  public botToken!: string;
  public scope!: string;
  public installedAt!: Date;
}

export default (sequelize: Sequelize, DataTypes: any) => {
  Workspace.init(
    {
      teamId: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      accessToken: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      botToken: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      scope: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      installedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'workspaces',
      timestamps: false,
    }
  );
  return Workspace;
};
