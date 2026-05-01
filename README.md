# 🚀 Premium Team Task Manager

A high-fidelity, full-stack task management platform built for modern teams. Featuring a premium SaaS aesthetic, glassmorphic UI, and robust real-time tracking.

![Dashboard Preview](https://via.placeholder.com/1200x600?text=Premium+Task+Manager+Dashboard)

## ✨ Key Features

- **💎 Premium UI/UX**: Modern dark theme with glassmorphism, smooth animations, and a cohesive SaaS aesthetic.
- **📊 Interactive Dashboard**: Real-time statistics, project completion progress rings, and recent activity tracking.
- **📁 Project Management**: Create and manage complex projects with dedicated detail views and teammate assignments.
- **📝 In-place Task Creation**: Optimized workflow with modal-driven task creation to keep users in their flow.
- **🔐 Secure Authentication**: Full JWT-based authentication with protected routes and role-based access control (Admin/Teammate).
- **📱 Fully Responsive**: Seamless experience across Desktop, Tablet, and Mobile devices.

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern component-based architecture.
- **Vite**: High-performance build tool.
- **Lucide React**: Beautiful, consistent iconography.
- **Vanilla CSS**: Custom-built design system for maximum performance and flexibility.

### Backend
- **Node.js & Express**: Scalable server architecture.
- **Sequelize (ORM)**: Robust database management.
- **MySQL**: Relational data storage for complex task relationships.
- **JWT**: Secure session management.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL Server

### 1. Clone the repository
```bash
git clone https://github.com/charansai2255/Team_Task_Manager.git
cd Team_Task_Manager
```

### 2. Install Dependencies
```bash
# Install root, backend, and frontend dependencies at once
npm install
```

### 3. Environment Setup
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=team_task_manager
JWT_SECRET=your_super_secret_key
```

### 4. Run Locally
```bash
# Start the backend and frontend in development mode
npm run dev
```

## 🌐 Deployment

This project is optimized for deployment on **Railway**.
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment**: Serve static React files via the Express backend for an all-in-one production build.

## 📄 License
This project is licensed under the MIT License.