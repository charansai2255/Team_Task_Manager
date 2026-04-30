import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

const router = express.Router();

const ownerInclude = {
  model: User,
  as: 'owner',
  attributes: ['id', 'name', 'email', 'role']
};

const membersInclude = {
  model: User,
  as: 'members',
  attributes: ['id', 'name', 'email', 'role'],
  through: { attributes: ['role'] }
};

const taskProjectInclude = {
  model: Project,
  as: 'project',
  attributes: ['id', 'name', 'ownerId']
};

const taskAssigneeInclude = {
  model: User,
  as: 'assignee',
  attributes: ['id', 'name', 'email']
};

const getProjectAccess = (project, userId) => {
  if (project.ownerId === userId) {
    return { currentUserRole: 'Owner', canCreateTasks: true, canManageMembers: true, canViewAllTasks: true };
  }

  const membership = Array.isArray(project.members)
    ? project.members.find(member => member.id === userId)
    : null;

  const currentUserRole = membership?.ProjectMembers?.role || null;

  return {
    currentUserRole,
    canCreateTasks: currentUserRole === 'Admin',
    canManageMembers: currentUserRole === 'Admin',
    canViewAllTasks: currentUserRole === 'Admin',
  };
};

const getAccessibleProjects = async (user) => {
  const ownedProjects = await Project.findAll({
    where: { ownerId: user.id },
    include: [ownerInclude, membersInclude],
    order: [['createdAt', 'DESC']]
  });

  const memberProjects = await user.getProjects({
    include: [ownerInclude, membersInclude],
    joinTableAttributes: ['role'],
    order: [['createdAt', 'DESC']]
  });

  const projectMap = new Map();

  ownedProjects.forEach(project => {
    projectMap.set(project.id, { project, access: getProjectAccess(project, user.id) });
  });

  memberProjects.forEach(project => {
    if (!projectMap.has(project.id)) {
      projectMap.set(project.id, { project, access: getProjectAccess(project, user.id) });
    }
  });

  return Array.from(projectMap.values());
};

const serializeTask = (task, access) => ({
  _id: task.id,
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate,
  project: task.project,
  assignee: task.assignee,
  assigneeId: task.assigneeId,
  canUpdate: access.canUpdate ?? true,
  canDelete: access.canDelete ?? access.canViewAllTasks,
  projectRole: access.currentUserRole,
});

// Get Tasks
router.get('/', protect, async (req, res) => {
  try {
    const projectAccessList = await getAccessibleProjects(req.user);
    const manageableProjects = projectAccessList.filter(entry => entry.access.canViewAllTasks);
    const memberProjects = projectAccessList.filter(entry => !entry.access.canViewAllTasks);

    const manageableTasks = manageableProjects.length
      ? await Task.findAll({
        where: { projectId: manageableProjects.map(entry => entry.project.id) },
        include: [taskProjectInclude, taskAssigneeInclude],
        order: [['createdAt', 'DESC']]
      })
      : [];

    const memberTasks = memberProjects.length
      ? await Task.findAll({
        where: { projectId: memberProjects.map(entry => entry.project.id), assigneeId: req.user.id },
        include: [taskProjectInclude, taskAssigneeInclude],
        order: [['createdAt', 'DESC']]
      })
      : [];

    const taskMap = new Map();

    manageableTasks.forEach(task => {
      const projectEntry = manageableProjects.find(entry => entry.project.id === task.projectId);
      taskMap.set(task.id, serializeTask(task, { ...projectEntry.access, canUpdate: true, canDelete: true }));
    });

    memberTasks.forEach(task => {
      if (!taskMap.has(task.id)) {
        const projectEntry = memberProjects.find(entry => entry.project.id === task.projectId);
        taskMap.set(task.id, serializeTask(task, { ...projectEntry.access, canUpdate: true, canDelete: false }));
      }
    });

    res.json(Array.from(taskMap.values()));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Task
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, project, assignee, dueDate, priority, status } = req.body;
    
    const projectExists = await Project.findByPk(project, {
      include: [ownerInclude, membersInclude]
    });
    if (!projectExists) return res.status(400).json({ message: 'Invalid project' });

    const projectAccess = getProjectAccess(projectExists, req.user.id);
    if (!projectAccess.canCreateTasks) {
      return res.status(403).json({ message: 'You can create tasks only in projects you admin' });
    }

    if (assignee) {
      const assigneeUser = await User.findByPk(assignee);
      if (!assigneeUser) {
        return res.status(400).json({ message: 'Invalid assignee' });
      }

      const isProjectOwner = projectExists.ownerId === assigneeUser.id;
      const isProjectMember = projectExists.members.some(member => member.id === assigneeUser.id);
      if (!isProjectOwner && !isProjectMember) {
        return res.status(400).json({ message: 'Assignee must be part of the project' });
      }
    }

    const task = await Task.create({
      title,
      description,
      projectId: project,
      assigneeId: assignee || null,
      dueDate: dueDate || null,
      priority: priority || 'Medium',
      status: status || 'Todo'
    });
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Status
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project', include: [ownerInclude, membersInclude] }]
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const projectAccess = getProjectAccess(task.project, req.user.id);
    if (!projectAccess.currentUserRole) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!projectAccess.canViewAllTasks && task.assigneeId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    task.status = req.body.status || task.status;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project', include: [ownerInclude, membersInclude] }]
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const projectAccess = getProjectAccess(task.project, req.user.id);
    if (!projectAccess.canViewAllTasks) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await task.destroy();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
