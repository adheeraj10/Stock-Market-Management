# Stock Trading Platform

A modern web application for real-time stock trading and portfolio management built with React.js and Node.js. The platform offers live market data through web scraping and features a sleek, responsive interface using Tailwind CSS.

## Features

- **User Authentication System**
  - User Registration with email and password
  - User Login with secure authentication (JWT + bcrypt)
  - Form validation and error handling

- **Real-Time Stock Data**
  - Live market data through web scraping (Google Finance)
  - Historical price trends with Chart.js
  - Market indicators and analytics

- **Portfolio Management**
  - Real-time portfolio valuation
  - Investment tracking
  - Transaction history with PDF generation
  - Buy/Sell stocks with virtual funds

- **AI Chatbot**
  - Groq AI integration for stock queries
  - Personalized investment advice

## Tech Stack

### Frontend
- React.js 18
- React Router v7
- Tailwind CSS 3
- Material UI & Material Tailwind
- Chart.js for data visualization
- Framer Motion animations

### Backend
- Node.js 18+
- Express.js 4
- PostgreSQL 12+ (Database)
- JWT for authentication
- bcrypt for password hashing
- Cheerio + Axios for web scraping
- PDFKit for report generation

## Database Support

### Primary: PostgreSQL
The app uses PostgreSQL as the primary database.

### Alternative: SQLite (for local development)
To use SQLite instead of PostgreSQL:
1. Install `sqlite3` package: `npm install sqlite3`
2. Modify `backend/db.js` to use SQLite connection
3. Update `backend/db/tables.sql` to SQLite-compatible syntax (remove `SERIAL`, `NUMERIC` types)

### Alternative: MySQL
To use MySQL:
1. Install `mysql2` package: `npm install mysql2`
2. Replace `pg` imports with `mysql2` in database files
3. Update SQL syntax for MySQL compatibility

## Prerequisites

- Node.js v18+ 
- PostgreSQL 12+ (or SQLite for local dev)
- npm or yarn

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd Stock-Market-Management

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Database Setup

**Option A: PostgreSQL (Recommended)**
```bash
# Start PostgreSQL service
# macOS:
brew services start postgresql@14

# Linux:
sudo service postgresql start

# Create database
psql postgres -c "CREATE DATABASE stock_market;"
```

**Option B: SQLite (Easier for local dev)**
SQLite file will be auto-created. Skip this step.

### 3. Environment Configuration

Create `backend/.env` file:

```bash
# Database Configuration (PostgreSQL)
DATABASE=stock_market
DB_USER=postgres          # Your PostgreSQL username
DB_PORT=5432
# PASSWORD=your_password  # Only if required by your PostgreSQL setup

# Server Configuration
PORT=4000

# AI Features (Optional - Get from https://groq.com)
GROQ_API_KEY=your_groq_api_key_here
```

**For SQLite, use this instead:**
```bash
DATABASE_URL=./stock_market.db
PORT=4000
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Update Frontend API URL

Edit `src/config.js`:
```javascript
// For local development:
export const API_URL = "http://localhost:4000";

// For production (update with your deployed backend URL):
// export const API_URL = "https://your-backend-url.com";
```

### 5. Seed Initial Data

```bash
cd backend

# Seed stock market data (generates 30 days of synthetic data)
node seed_market_data.js

# Fetch real-time stock prices
node real_time_data_fet.js
```

### 6. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Backend runs on http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
npm start
# Frontend runs on http://localhost:3000
```

Access the app at: **http://localhost:3000**

## Deployment

### Deploy to Render (Recommended Free Option)

1. **Push code to GitHub** (ensure `.env` and `node_modules` are in `.gitignore`)

2. **Create PostgreSQL Database on Render:**
   - Go to Render Dashboard → New PostgreSQL
   - Name: `stock-market-db`
   - Plan: Free
   - Copy the Internal Database URL

3. **Deploy Backend:**
   - New Web Service
   - Connect your GitHub repo
   - Name: `stock-market-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add Environment Variables:
     - `DATABASE_URL`: (from step 2)
     - `GROQ_API_KEY`: (your API key)
     - `NODE_VERSION`: `18.x`

4. **Deploy Frontend:**
   - New Static Site
   - Name: `stock-market-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
   - Add Environment Variable:
     - `REACT_APP_API_URL`: `https://stock-market-backend.onrender.com`

### Deploy to Heroku

```bash
# Install Heroku CLI and login
heroku login

# Create Heroku apps
heroku create stock-market-backend
heroku create stock-market-frontend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini -a stock-market-backend

# Deploy backend
git subtree push --prefix backend heroku-backend main

# Deploy frontend
heroku config:set REACT_APP_API_URL=https://stock-market-backend.herokuapp.com -a stock-market-frontend
git subtree push --prefix frontend heroku-frontend main
```

## Project Structure

```
Stock-Market-Management/
├── backend/                 # Node.js Express server
│   ├── db/
│   │   └── tables.sql      # Database schema
│   ├── server.js           # Main server file
│   ├── seed_market_data.js # Seed script for market data
│   ├── real_time_data_fet.js # Stock price scraper
│   ├── AI_query_chatbot.js   # AI chatbot integration
│   └── package.json
├── src/                    # React frontend
│   ├── Components/         # Reusable UI components
│   ├── Pages/             # Page components (Home, Trade, Portfolio, etc.)
│   ├── config.js          # API URL configuration
│   └── App.js             # Main app component
├── public/                # Static assets
├── package.json           # Frontend dependencies
├── render.yaml            # Render deployment config
└── README.md
```

## Troubleshooting

**Stocks not displaying:**
- Check backend is running: `curl http://localhost:4000/api/companies`
- Ensure `market_data` table has data: `node backend/seed_market_data.js`
- Verify `src/config.js` points to correct backend URL

**Database connection errors:**
- Verify PostgreSQL is running
- Check `.env` credentials match your PostgreSQL setup
- For local dev, try trust authentication (no password)

**Frontend API errors:**
- Ensure backend URL in `src/config.js` matches your backend port
- Check CORS is enabled in `backend/server.js`

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is MIT licensed.

---

**Note:** This is a demo application for educational purposes. Stock data is for simulation only.
