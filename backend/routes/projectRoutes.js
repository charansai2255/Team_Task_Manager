import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Task from '../models/Task.js';

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

const taskAssigneeInclude = {
  model: User,
  as: 'assignee',
  attributes: ['id', 'name', 'email']
};

const getCurrentUserProjectAccess = (project, userId) => {
  if (project.ownerId === userId) {
    return {
      currentUserRole: 'Owner',
      canCreateTasks: true,
      canManageMembers: true,
      canViewAllTasks: true,
    };
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

const decorateProject = (project, userId) => {
  const access = getCurrentUserProjectAccess(project, userId);

  return {
    _id: project.id,
    id: project.id,
    name: project.name,
    description: project.description,
    owner: project.owner ? {
      id: project.owner.id,
      name: project.owner.name,
      email: project.owner.email,
      role: project.owner.role
    } : null,
    memberCount: Array.isArray(project.members) ? project.members.length : 0,
    members: Array.isArray(project.members)
      ? project.members.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        membershipRole: member.ProjectMembers?.role || 'Member'
      }))
      : [],
    ...access,
  };
};

const serializeProjectListItem = (project) => ({
  _id: project._id,
  id: project.id,
  name: project.name,
  description: project.description,
  owner: project.owner,
  memberCount: project.memberCount,
  members: project.members,
  currentUserRole: project.currentUserRole,
  canCreateTasks: project.canCreateTasks,
  canManageMembers: project.canManageMembers,
  canViewAllTasks: project.canViewAllTasks,
});

const serializeTask = (task) => ({
  _id: task.id,
  id: task.id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  dueDate: task.dueDate,
  assignee: task.assignee ? {
    id: task.assignee.id,
    name: task.assignee.name,
    email: task.assignee.email
  } : null,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt
});

const loadAccessibleProjects = async (user) => {
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
    projectMap.set(project.id, decorateProject(project, user.id));
  });

  memberProjects.forEach(project => {
    if (!projectMap.has(project.id)) {
      projectMap.set(project.id, decorateProject(project, user.id));
    }
  });

  return Array.from(projectMap.values());
};

const loadProjectForUser = async (user, projectId) => {
  const project = await Project.findByPk(projectId, {
    include: [ownerInclude, membersInclude]
  });

  if (!project) {
    return null;
  }

  const access = getCurrentUserProjectAccess(project, user.id);
  if (!access.currentUserRole) {
    return null;
  }

  return {
    ...decorateProject(project, user.id),
    project,
  };
};

router.get('/', protect, async (req, res) => {
  try {
    const projects = await loadAccessibleProjects(req.user);
    res.json(projects.map(serializeProjectListItem));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, description, memberEmails } = req.body;
    const project = await Project.create({ name, description, ownerId: req.user.id });
    if (memberEmails && memberEmails.length > 0) {
      const users = await User.findAll({ where: { email: memberEmails } });
      await project.addMembers(users, { through: { role: 'Member' } });
    }
    res.status(201).json(project);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const projectAccess = await loadProjectForUser(req.user, req.params.id);

    if (!projectAccess) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { project, currentUserRole, canCreateTasks, canManageMembers, canViewAllTasks } = projectAccess;
    const canSeeAllTasks = canViewAllTasks;

    const tasks = await Task.findAll({
      where: canSeeAllTasks ? { projectId: project.id } : { projectId: project.id, assigneeId: req.user.id },
      include: [taskAssigneeInclude],
      order: [['createdAt', 'DESC']]
    });

    const serializedTasks = tasks.map(serializeTask);
    const taskSummary = serializedTasks.reduce((summary, task) => {
      summary.total += 1;
      summary[task.status] = (summary[task.status] || 0) + 1;
      return summary;
    }, { total: 0, Todo: 0, 'In Progress': 0, Done: 0 });

    res.json({
      _id: project.id,
      id: project.id,
      name: project.name,
      description: project.description,
      owner: project.owner ? {
        id: project.owner.id,
        name: project.owner.name,
        email: project.owner.email,
        role: project.owner.role
      } : null,
      members: project.members.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        membershipRole: member.ProjectMembers?.role || 'Member'
      })),
      memberCount: project.members.length,
      tasks: serializedTasks,
      taskSummary,
      currentUserRole,
      canCreateTasks,
      canManageMembers,
      canViewAllTasks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id/members/:memberId', protect, async (req, res) => {
  try {
    const projectAccess = await loadProjectForUser(req.user, req.params.id);

    if (!projectAccess) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!projectAccess.canManageMembers) {
      return res.status(403).json({ message: 'Only project admins can remove members' });
    }

    if (req.params.memberId === projectAccess.project.ownerId) {
      return res.status(400).json({ message: 'Owner cannot be removed from the project' });
    }

    const member = await User.findByPk(req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const membership = projectAccess.project.members.find(m => m.id === member.id);
    if (!membership) {
      return res.status(404).json({ message: 'Member is not part of this project' });
    }

    await projectAccess.project.removeMember(member);
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/members', protect, async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const membershipRole = role === 'Admin' ? 'Admin' : 'Member';

    const projectAccess = await loadProjectForUser(req.user, req.params.id);

    if (!projectAccess) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!projectAccess.canManageMembers) {
      return res.status(403).json({ message: 'Only project admins can add members' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const member = await User.findOne({ where: { email: normalizedEmail } });

    if (!member) {
      return res.status(404).json({ message: 'No existing user exists with this email' });
    }

    if (member.id === projectAccess.project.ownerId) {
      return res.status(400).json({ message: 'Owner is already part of the project' });
    }

    const existingMembership = projectAccess.project.members.find(m => m.id === member.id);
    if (existingMembership) {
      return res.status(400).json({ message: 'User is already a project member' });
    }

    await projectAccess.project.addMember(member, { through: { role: membershipRole } });

    res.status(201).json({
      message: 'Member added',
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        membershipRole
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/teammates', protect, async (req, res) => {
  console.log(`GET /teammates request for ID: ${req.params.id}`);
  try {
    const projectAccess = await loadProjectForUser(req.user, req.params.id);

    if (!projectAccess) {
      console.log(`Project NOT FOUND for ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Project not found' });
    }

    const p = projectAccess.project;

    console.log(`Project Found: ${p.name}. Members: ${p.members?.length || 0}`);
    
    const list = [];
    if (p.owner) {
      console.log(`Adding Owner: ${p.owner.name}`);
      list.push({ id: p.owner.id, name: p.owner.name });
    }
    
    if (p.members && p.members.length > 0) {
      p.members.forEach(m => {
        console.log(`Adding Member: ${m.name}`);
        list.push({ id: m.id, name: m.name });
      });
    }

    console.log(`Returning list of ${list.length} teammates`);
    res.json(list);
  } catch (err) { 
    console.error(`ERROR in /teammates: ${err.message}`);
    res.status(500).json({ message: err.message }); 
  }
});

export default router;
