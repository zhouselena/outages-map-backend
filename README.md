# Outages Map Backend

## Features

### Admin Panel (`/admin`)
- **Secure login** with JWT authentication
- **Add single outage** via a rich form (all fields from the CSV schema)
- **Bulk import** via CSV upload (same structure as the project dataset)
- **Manage records** — paginated table with delete functionality
- All changes immediately reflected on the public map

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React-Leaflet, CSS Modules |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Maps | Leaflet.js with OpenStreetMap tiles |

---

## Project Structure

```
outages-map-backend/
├── models/               # Outage.js, Admin.js
├── routes/               # auth.js, outages.js
├── middleware/           # auth.js (JWT)
├── utils/                # regionMap.js, csvParser.js, seed.js
├── data/                 # outages.csv (seed data)
└── package.json
```

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local instance or Atlas connection string)

### 1. Clone & Install

```bash
git clone https://github.com/zhouselena/outages-map-backend
cd outages-map-backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/outages-map
JWT_SECRET=your-very-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This will:
- Create the admin user from your `.env` credentials
- Import all outages from `/data/outages.csv`

### 4. Run

```bash
npm run dev # Port 5001

```

---

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/outages` | List outages (filterable by year, provider, region) |
| GET | `/api/outages/stats` | Aggregated stats per region (for map rendering) |
| GET | `/api/outages/years` | Available years in database |
| GET | `/api/outages/:id` | Single outage detail |

### Admin (JWT required)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/verify` | Verify token |
| POST | `/api/outages` | Create single outage |
| POST | `/api/outages/import` | Import CSV file |
| PUT | `/api/outages/:id` | Update outage |
| DELETE | `/api/outages/:id` | Delete outage |

---

## CSV Format

When importing via the admin panel, use this column structure:

```
Column, event_type, provider, service, region, timezone, start_date, start_time,
end_date, end_time, source, outage_id, duration_hours, root_cause, severity,
downstream_apps, estimated_users_affected
```

- `provider`: AWS / Azure / GCP / Other
- `region`: AWS region codes (e.g. `us-east-1`), Azure region names, or geographic names
- `start_date` / `end_date`: MM/DD/YYYY format
- `start_time` / `end_time`: HH:MM:SS AM/PM format
- `severity`: Partial / Full

---

## Region Mapping

The app includes a comprehensive region mapping for AWS and Azure regions to geographic coordinates. If a region isn't recognized, the outage will still be stored but won't appear on the map (edit `backend/utils/regionMap.js` to add new regions).

---

## Deployment

### Backend (Railway / Render / Fly.io)
Set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` as environment variables.

---

## Default Credentials

After running seed:
- Username: `admin` (or whatever you set in `.env`)
- Password: `admin123` (or whatever you set in `.env`)

**Change these before deploying to production.**
