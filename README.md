# 🏭 Hourly Monitoring System (HMS)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)

> A comprehensive digital solution designed to replace physical hourly monitoring sheets in modern manufacturing operations. 

The **Hourly Monitoring System (HMS)** allows machine operators and line engineers to meticulously log, track, and analyze hourly production data, operational losses, and overall equipment efficiency across various shifts in real-time.

---

## ✨ Key Features

- ⏱️ **Real-time Autosave**: Never lose data. Entries are auto-saved seamlessly.
- 📊 **Shift Management**: Pre-configured dynamic time slots spanning across 3 different production shifts.
- 🔍 **Detailed Loss Tracking**: Comprehensive matrix mapping 13 different categories of production loss (Maintenance, Quality, Tooling, Operator, etc.).
- 📈 **Performance Metrics**: Automatic calculation of Cumulative Quantity, Hourly Output, and Standard Variance.
- 🗄️ **Historical Tracking**: Read-only history view for auditing previous days, shifts, and machine output.
- 📱 **Modern UI/UX**: Sleek, responsive, and robust interface built with React and Tailwind CSS.

## 🏗️ Architecture & Tech Stack

HMS is built using a modern decoupled architecture:

* **Frontend (`/`)**: A Single Page Application (SPA) built with React, Vite, and Tailwind CSS.
* **Backend (`/server`)**: A reliable RESTful API powered by Node.js, Express, and Typescript.
* **Database**: Relational data persisting on a **MySQL 8.0+** database.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)

### 1. Database Configuration
Create a new MySQL database named `hms_system` and run the schema setup:
```bash
# Using CLI
mysql -u root -p < server/src/db/schema.sql
```

### 2. Backend Setup
Open a terminal in the `/server` directory:
```bash
cd server
npm install
cp .env.example .env

# Don't forget to update the database credentials inside .env!

npm run migrate
npm run dev
```

### 3. Frontend Setup
Open a new terminal window at the project root:
```bash
npm install
cp .env.example .env.local

# Run the Vite development server
npm run dev
```
Access the application at `http://localhost:5173`.

---

## 📖 Deployment

For detailed instructions on deploying the HMS application to a dedicated local network company PC (using `PM2` for process management), please read the [DEPLOYMENT.md](./DEPLOYMENT.md) guide.

## 📂 Project Structure
```text
.
├── src/                # Frontend application code 
│   ├── components/     # Reusable UI components
│   ├── pages/          # Full page layouts (Data Entry, History)
│   ├── lib/            # Utilities (api wrappers, formatters)
│   └── ...
├── server/             # Backend API code
│   ├── src/
│   │   ├── controllers/# Business logic
│   │   ├── routes/     # Express route definitions
│   │   └── db/         # MySQL connection & schemas
├── DEPLOYMENT.md       # Production setup instructions
└── ecosystem.config.cjs# PM2 setup config
```

## 📜 License
Proprietary - SKF Manufacturing
