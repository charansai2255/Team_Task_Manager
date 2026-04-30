import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Project from './Project.js';
import User from './User.js';

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM('Todo', 'In Progress', 'Done'),
    defaultValue: 'Todo',
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High'),
    defaultValue: 'Medium',
  },
  dueDate: {
    type: DataTypes.DATE,
  }
}, {
  timestamps: true,
});

// Relationships
Task.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });
Project.hasMany(Task, { as: 'tasks', foreignKey: 'projectId' });

export default Task;
