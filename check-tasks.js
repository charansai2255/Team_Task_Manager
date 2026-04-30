import Task from './backend/models/Task.js';
import User from './backend/models/User.js';
import Project from './backend/models/Project.js';

async function checkTasks() {
  const tasks = await Task.findAll({
    include: [
      { model: User, as: 'assignee', attributes: ['name', 'email'] },
      { model: Project, as: 'project', attributes: ['name'] }
    ]
  });
  
  console.log(`TOTAL TASKS: ${tasks.length}`);
  tasks.forEach(t => {
    console.log(`Task: ${t.title}`);
    console.log(`  Project: ${t.project ? t.project.name : 'NONE'}`);
    console.log(`  Assignee: ${t.assignee ? t.assignee.name : 'UNASSIGNED'} (ID: ${t.assigneeId})`);
    console.log(`  Status: ${t.status}`);
  });
  process.exit(0);
}

checkTasks();
