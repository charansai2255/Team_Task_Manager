import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import sequelize from './config/database.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Sync database
sequelize.sync({ alter: true })
  .then(() => console.log('MySQL Database Connected via Sequelize'))
  .catch(err => console.log('MySQL Connection Error:', err));


app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production' || true) {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.use((req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }

    const htmlPath = path.resolve(__dirname, '../frontend/dist', 'index.html');
    if (fs.existsSync(htmlPath)) {
      res.setHeader('Content-Type', 'text/html');
      res.send(fs.readFileSync(htmlPath, 'utf8'));
    } else {
      res.status(404).send('Frontend not built');
    }
  });
}


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
