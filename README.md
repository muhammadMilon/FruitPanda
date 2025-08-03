# E-commerce Project

This is a full-stack e-commerce application with a React frontend and Node.js backend.

## Project Structure

```
Project/
├── client/          # Frontend (React + TypeScript + Vite)
│   ├── src/         # React source code
│   ├── public/      # Static assets
│   ├── package.json # Frontend dependencies
│   └── ...          # Frontend configuration files
└── server/          # Backend (Node.js + Express)
    ├── routes/      # API routes
    ├── models/      # Database models
    ├── middleware/  # Express middleware
    ├── utils/       # Utility functions
    ├── scripts/     # Database scripts
    ├── index.js     # Server entry point
    └── package.json # Backend dependencies
```

## Getting Started

### Frontend (Client)
```bash
cd client
npm install
npm run dev
```

### Backend (Server)
```bash
cd server
npm install
npm start
```

## Features

- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js with Express, MongoDB
- **Authentication**: Google OAuth, JWT
- **Payment**: Stripe integration
- **Admin Dashboard**: Product management, order tracking
- **Seller Portal**: Seller registration and product management
- **AI Features**: Fruit analysis and recommendations

## Documentation

- `client/SELLER_DASHBOARD_SETUP.md` - Seller dashboard setup guide
- `client/GOOGLE_OAUTH_SETUP.md` - Google OAuth configuration

## Development

The project is now organized into two main directories:
- `client/` - Contains all frontend-related code and configuration
- `server/` - Contains all backend-related code and configuration

This separation makes it easier to manage dependencies and deploy frontend and backend independently.