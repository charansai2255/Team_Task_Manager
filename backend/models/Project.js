import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  }
}, {
  timestamps: true,
});

// Relationships
Project.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

// Many-to-Many for members
export const ProjectMembers = sequelize.define('ProjectMembers', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  }
  ,
  role: {
    type: DataTypes.ENUM('Admin', 'Member'),
    defaultValue: 'Member',
    allowNull: false,
  }
}, { timestamps: false });

Project.belongsToMany(User, { through: ProjectMembers, as: 'members', foreignKey: 'projectId' });
User.belongsToMany(Project, { through: ProjectMembers, as: 'projects', foreignKey: 'userId' });

export default Project;
