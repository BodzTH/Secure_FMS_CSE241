# Secure File Management System (FMS)

A secure file management system built with Next.js frontend and Node.js/Express backend with MongoDB database.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (v6.0 or higher)

## Project Structure

```
Secure_FMS_CSE241/
├── backend/          # Express. js API server (Port 5000)
└── frontend/         # Next.js web application (Port 3000)
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/BodzTH/Secure_FMS_CSE241.git
cd Secure_FMS_CSE241
```

### 2. Setup MongoDB

#### Option A: Local MongoDB Installation

**Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. MongoDB will run as a Windows service automatically

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

Verify MongoDB is running:
```bash
mongosh
```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and update `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://<username>:<password>@cluster. mongodb.net/secure_fms
   ```

### 3. Setup Backend

```bash
cd backend
npm install
```

Configure your environment variables in the `.env` file: 

```env
MONGO_URI=mongodb://localhost:27017/secure_fms
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
BASE_URL=http://localhost:5000
```

> ⚠️ **Important:** Change `JWT_SECRET` and `ENCRYPTION_KEY` to secure random values in production!

Start the backend server:

```bash
npm start
```

The backend API will be running at [http://localhost:5000](http://localhost:5000)

### 4. Setup Frontend

Open a **new terminal** and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000)

## Quick Start (All Services)

Run these commands in separate terminal windows:

**Terminal 1 - MongoDB (if not running as service):**
```bash
mongod
```

**Terminal 2 - Backend:**
```bash
cd backend
npm start
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

## Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm start` | Start the backend server on port 5000 |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/secure_fms` |
| `JWT_SECRET` | Secret key for JWT tokens | - |
| `ENCRYPTION_KEY` | Key for file encryption (64 hex chars) | - |
| `BASE_URL` | Backend server URL | `http://localhost:5000` |

## Tech Stack

### Backend
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Multer for file uploads

### Frontend
- Next.js 16
- React 19
- Tailwind CSS
- Axios

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running:  `sudo systemctl status mongodb`
- Check if port 27017 is not blocked
- Verify connection string in `.env` file

### Port Already in Use
- Backend (5000): `lsof -i :5000` then `kill -9 <PID>`
- Frontend (3000): `lsof -i :3000` then `kill -9 <PID>`
