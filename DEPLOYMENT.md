# HMS (Hourly Monitoring System) - Production Setup Guide

A complete digital replacement for the physical Hourly Monitoring System sheet used in manufacturing operations. The system allows operators to log hourly production data across 3 shifts with autosave, loss tracking, and management reporting.

## Project Architecture

### Frontend
- **Location**: `/` (root directory)
- **Tech**: React + TypeScript + Tailwind CSS + Vite
- **Features**: Data entry, history view, real-time autosave, responsive design

### Backend
- **Location**: `/server`
- **Tech**: Node.js + Express + TypeScript + MySQL
- **Features**: RESTful APIs, data persistence, validation, error handling

## Database Design

### Tables
1. **shift_logs** - Stores shift information
   - id, date, shift_id, machine, channel, timestamps

2. **hourly_entries** - Hourly production entries
   - id, shift_log_id, time_slot, cum_qty, hrly_qty, std_variance, reasons_text

3. **loss_details** - Loss reasons (13 columns)
   - ct_loss, start_loss, maintenance, reset, material, supplier, tool, etc.

4. **production_summary** - Shift summary statistics
   - total_production, scrap, rework, efficiency, quality_status, approvals

5. **system_config** - Configuration storage

## Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- MySQL 8.0+
- npm or yarn

### 1. Database Setup

```bash
# Using MySQL CLI
mysql -u root -p < server/src/db/schema.sql

# Or create database manually
CREATE DATABASE hms_system;
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=hms_system
# PORT=5000

# Run migrations
npm run migrate

# Start development server
npm run dev

# Or build and run production
npm run build
npm start
```

### 3. Frontend Setup

```bash
# In project root directory

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Ensure VITE_API_URL points to backend
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev

# Build for production
npm run build
```

## API Endpoints

### Shifts
- `GET /api/shifts?date=YYYY-MM-DD&shift=1&machine=ODC-2&channel=HMS`
- `POST /api/shifts` - Create or get shift
- `GET /api/shifts/:id` - Get shift with full data

### Entries
- `GET /api/entries?shift_log_id=xxx`
- `PUT /api/entries/:id` - Update hourly entry
- `PUT /api/entries/:id/loss` - Update loss details

### Summary
- `GET /api/summary/:shift_log_id`
- `PUT /api/summary/:shift_log_id` - Update shift summary

## Shift Configuration

### Time Slots (Fixed in system)

**Shift 1: 06:54 – 15:24** (9 slots)
- 06:54 - 07:54, 07:54 - 08:54, ... 14:54 - 15:24

**Shift 2: 15:24 – 23:36** (8 slots)
- 15:24 - 16:24, 16:24 - 17:24, ... 22:24 - 23:36

**Shift 3: 23:36 – 06:54** (8 slots)
- 23:36 - 00:36, 00:36 - 01:36, ... 06:36 - 06:54

## Loss Columns

1. CT Loss
2. Start Loss
3. Maintenance (MAINT)
4. RESET
5. Material
6. Supplier
7. Tool
8. Spindle Service
9. Wheel Change
10. Operator (OPTR)
11. Plan Stop (PLN STOP)
12. Quality (QLTY)
13. System

## Features Overview

### Data Entry Page
- Date, machine, channel, and shift selector
- Expandable loss columns (click "Loss (n)" to expand)
- Auto-expanding textarea for reasons
- Quick-insert buttons for common phrases
- Automatic hourly quantity calculation (CUM QTY difference)
- Standard variance calculation
- Debounced autosave (800ms delay)

### History Page
- Date picker to view historical shifts
- Shift tabs (1, 2, 3)
- Read-only table view with production summary
- Sticky header and left columns for easy navigation

### Summary Panel
- Production metrics (total, scrap, efficiency)
- Quality status
- Machine information
- Approvals (engineer, manager)
- Real-time autosave indicator

## Local Network Deployment (Company PC)

This application is designed to be hosted on a local Windows PC within the company network using PM2 (Process Manager) to keep the backend and frontend running reliably.

### 1. Clone & Initial Setup
Clone the repository to the designated host PC and install dependencies for both the frontend and backend.
```bash
git clone <repository_url>
cd Hourly_Monitoring_System

# Install root dependencies (includes `serve` for frontend)
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment & Database
Ensure MySQL is running locally on the host PC. 

Navigate to the `server/` directory and set up your `.env` file:
```bash
cp server/.env.example server/.env
```
Edit `server/.env` with local database credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hms_system
NODE_ENV=production
```
Migrate the database schema:
```bash
cd server
npm run migrate
cd ..
```

### 3. Build the Application
Compile the React frontend and the TypeScript backend into production-ready static/JS files:
```bash
# Build Backend
cd server
npm run build
cd ..

# Build Frontend
npm run build
```

### 4. Start Server via PM2
The project includes an `ecosystem.config.cjs` file configured specifically for Windows to run the backend API and the frontend static server concurrently without using buggy shell wrappers.

Ensure PM2 is installed globally:
```bash
npm install -g pm2
```

Start the application:
```bash
pm2 start ecosystem.config.cjs
```

The system is now running! 
- The Frontend is locally accessible at `http://localhost:3000`
- The Backend API is running on `http://localhost:5000`

**Useful PM2 Commands:**
- `pm2 status`: Check if `hms-frontend` and `hms-backend` are marked "online"
- `pm2 logs`: View live output/errors from both servers
- `pm2 save`: Save current processes so PM2 can resurrect them on machine reboot
- `pm2 restart ecosystem.config.cjs`: Restart the servers after updating code

## Testing the System

### 1. Verify Backend
```bash
curl http://localhost:5000/health
# Should respond with: {"status":"ok","timestamp":"..."}
```

### 2. Test API
```bash
# Create a new shift
curl -X POST http://localhost:5000/api/shifts \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-04-04",
    "shift_id": 1,
    "machine": "ODC-2",
    "channel": "HMS"
  }'

# Get shifts for a date
curl "http://localhost:5000/api/shifts?date=2026-04-04"
```

### 3. Frontend Testing
- Open http://localhost:5173
- Select shift date, machine, channel
- Enter some production data
- Check "Saved" indicator appears
- Verify data persists on page reload

## Troubleshooting

### Database Connection Error
- Check MySQL is running: `mysql -u root -p -e "SELECT 1"`
- Verify credentials in `.env`
- Check port 3306 is not blocked

### API Not Responding
- Ensure backend is running: `npm run dev` in /server
- Check port 5000 is free: `lsof -i :5000`
- Verify VITE_API_URL in frontend .env.local

### Data Not Saving
- Check browser console for errors (F12)
- Verify Network tab shows PUT requests succeeding
- Check backend logs for SQL errors

## Performance Optimization

- Debounced autosave (800ms)
- Lazy loading components
- Optimized re-renders with React.memo (if needed)
- Database indexes on common queries
- Connection pooling (10 connections)

## Security Considerations

For production:
- Add authentication/authorization
- Use HTTPS/TLS
- Add rate limiting
- Implement CSRF protection
- Validate all inputs
- Use environment-specific configs
- Add request logging

## File Structure

```
. (root)
├── src/                      # Frontend React app
│   ├── components/           # React components
│   ├── pages/               # Page routes
│   ├── lib/                 # Utilities (api.ts, storage.ts)
│   ├── types/               # TypeScript types
│   └── App.tsx
│
└── server/                    # Backend Express app
    ├── src/
    │   ├── controllers/      # Business logic
    │   ├── routes/          # API routes
    │   ├── db/              # Database setup
    │   ├── utils/           # Helpers, validation
    │   └── server.ts        # Express app entry
    └── package.json
```

## Contributing

- Follow TypeScript strict mode
- Use functional components with hooks
- Keep components focused and reusable
- Add proper error handling
- Document complex logic

## License

Proprietary - SKF Manufacturing

## Support

For issues or questions:
1. Check this README
2. Review code comments
3. Check browser/server console logs
4. Create GitHub issue with error details
