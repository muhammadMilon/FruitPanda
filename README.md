# 🍉 FruitPanda - Enhanced Fruit Marketplace

FruitPanda is a next-generation digital marketplace designed to connect verified farmers directly with urban consumers. By eliminating middlemen, the platform ensures fair pricing, improved transparency, and higher-quality produce for everyone. Leveraging cutting-edge AI technologies like Google Gemini for real-time fruit quality analysis and dynamic pricing forecasts, FruitPanda brings innovation to the agricultural supply chain.

With bilingual support (Bengali & English), robust user dashboards, and secure payment systems, FruitPanda is designed to be inclusive, efficient, and intelligent—empowering both producers and consumers across the nation.

---

## 🚀 Key Features

### 🛒 Marketplace & Accessibility
- **Direct Farmer-to-Consumer Model**: Seamless connections between verified farmers and urban consumers
- **Multilingual Interface**: Supports Bengali and English for broad accessibility
- **Nutritional Insights**: Displays fruit-specific health benefits and nutritional facts

### 📊 Dashboards & Order Management
- **Real-Time Analytics**: Track orders, sales, and inventory across roles
- **Admin Dashboard**: Manage users, content, analytics, and overall platform metrics
- **Seller Dashboard**: Handle product listings, order fulfillment, and inventory
- **Order Lifecycle Management**: Full control from order placement to delivery tracking

### 👥 User Roles & Access Control
- **Role-Based Access**: Custom permissions for users, sellers, and administrators
- **Seller Verification**: Authenticate real farmers before product listings are approved

### 💳 Payments & Smart Pricing
- **Multiple Payment Integrations**: Mobile banking, SSLCommerz, and others
- **AI-Powered Dynamic Pricing**: Adjusts prices based on market trends and seasonal availability

### 🔐 Security & Authentication
- **Secure Auth Systems**: JWT-based login and Google OAuth integration
- **Advanced API Protection**: Helmet.js, CORS, input validation, and rate limiting

---

## 🛠 Technology Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS for UI design
- Vite for build performance
- React Router for seamless navigation
- Lucide React for scalable icons

### Backend
- Node.js with Express
- MongoDB (Mongoose ORM)
- JWT for authentication
- Passport.js for Google OAuth
- Multer for handling file uploads

### Additional Integrations
- **Cloudinary**: Image storage and optimization
- **Nodemailer**: Transactional email service
- **SSLCommerz**: Secure payment processing

---

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google Gemini API Key

### Environment Variables (`.env`)
```env
# Server
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/fruitpanda

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
SESSION_SECRET=your-session-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Email (SMTP)
EMAIL_FROM=noreply@fruitpanda.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SSL Commerz
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-store-password
SSLCOMMERZ_IS_LIVE=false
```

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd fruit-panda

# Install dependencies
npm install

# Start MongoDB (if local)
mongod

# Start backend server
npm run server:dev

# Start frontend
npm run dev
```

Frontend: [http://localhost:5173](http://localhost:5173)  
Backend: [http://localhost:3000/api](http://localhost:3000/api)

---

## 📱 Key Components

### 📈 Dynamic Pricing Module (`/seasonal-forecast`)
- Seasonal calendar view
- Consumer recommendations for optimal purchase timing

### 🛠 Admin Dashboard (`/admin`)
- User role management
- Order and inventory insights
- Report generation and system logs

### 🧺 Seller Dashboard (`/seller-dashboard`)
- Product and inventory management
- Order status updates
- Sales trend visualizations

---

## 🔐 Security Highlights
- JWT & Google OAuth authentication
- Role-Based Access Control (RBAC)
- Express-validator for backend input validation
- Helmet.js for HTTP security headers
- CORS & rate limiting to prevent API abuse

---

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/register        # Register new user  
POST /api/auth/login           # Login user  
GET  /api/auth/google          # Google OAuth  
POST /api/auth/logout          # Logout session
```

### Product Management
```
GET    /api/products           # Retrieve all products  
POST   /api/products           # Add new product (seller/admin)  
PUT    /api/products/:id       # Update product details  
DELETE /api/products/:id       # Delete a product
```

### Order Management
```
GET    /api/orders             # View all orders  
POST   /api/orders             # Create a new order  
PATCH  /api/orders/:id/status  # Update order status
```

### Admin
```
GET   /api/admin/users                # Get all users  
PATCH /api/admin/users/:id/role      # Update user roles  
GET   /api/admin/dashboard/stats     # Analytics summary
```

---

## 🚀 Deployment Guide

### Frontend Hosting Options
- Vercel
- Netlify
- GitHub Pages

### Backend Deployment
- Railway
- Heroku
- DigitalOcean
- AWS EC2 or Lambda

### Database Hosting
- MongoDB Atlas (Recommended)
- Local MongoDB for testing

---

## 🤝 Contribution Guide
1. Fork the repo  
2. Create a new feature branch (`git checkout -b feature-name`)  
3. Implement and test changes  
4. Push to your fork  
5. Create a pull request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more info.

---

## 🆘 Support & Contact

📧 Email: fruitpanda250@gmail.com  
📚 Documentation: [click here](https://docs.google.com/document/d/1fFjxfOpP9YQIdVWerd-9Zj0cQSIMxv-shBwWLykIj6s/edit?tab=t.0#heading=h.cjcrecs9jm9l)  
🐞 Report issues: [GitHub Issues Page]

---

## 📦 Version 1.0.0 (Current)

- Initial launch  
- Admin & seller dashboards  

---

**FruitPanda — Delivering Freshness, Naturally 🍎🌱⚡**
