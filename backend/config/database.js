import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("DB_PASSWORD is:", process.env.DB_PASSWORD ? "SET" : "NOT SET OR EMPTY");
console.log("Loaded from path:", path.resolve(__dirname, '../.env'));

const sequelize = new Sequelize(
  process.env.DB_NAME || 'team_task_manager',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
  }
);

export default sequelize;
