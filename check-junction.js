import sequelize from './backend/config/database.js';

async function checkJunction() {
  try {
    const [results] = await sequelize.query("SELECT * FROM ProjectMembers");
    console.log("PROJECT MEMBERS JUNCTION TABLE:");
    console.table(results);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkJunction();
