import Project from './backend/models/Project.js';
import User from './backend/models/User.js';

async function test() {
  const projects = await Project.findAll();
  for (const p of projects) {
    const project = await Project.findByPk(p.id, {
      include: [
        { model: User, as: 'members', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
      ]
    });
    console.log(`Project: ${p.name}`);
    console.log(`  Owner: ${project.owner ? project.owner.name : 'NONE'}`);
    console.log(`  Members: ${project.members.length}`);
    project.members.forEach(m => console.log(`    - ${m.name}`));
  }
  process.exit(0);
}

test();
