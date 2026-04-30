import sequelize from './backend/config/database.js';
import Project from './backend/models/Project.js';
import User from './backend/models/User.js';

async function checkData() {
  try {
    const projects = await Project.findAll({
      include: [
        { model: User, as: 'owner' },
        { model: User, as: 'members' }
      ]
    });
    
    console.log('--- PROJECTS REPORT ---');
    projects.forEach(p => {
      console.log(`Project: ${p.name} (${p.id})`);
      console.log(`  Owner: ${p.owner ? p.owner.name : 'MISSING'} (ID: ${p.ownerId})`);
      console.log(`  Members: ${p.members.length}`);
      p.members.forEach(m => console.log(`    - ${m.name} (${m.email})`));
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
