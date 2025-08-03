# FruitPanda - Enhanced Fruit Marketplace Platform

The main goal of the Fruit Panda platform is to connect farmers directly with city buyers, removing middlemen and ensuring fair prices for everyone. It uses AI technologies like Google Gemini to scan and analyze fruit quality in real time, building trust and transparency. The platform also offers smart price forecasts based on market trends and seasonal changes, helping users make better choices. With support for both Bengali and English, Fruit Panda is easy to use for a wide range of people. Overall, it aims to support farmers, modernize the supply chain, and make fruit shopping smarter and more efficient.


## 🚀 Features

### 🛒 Marketplace & User Accessibility
- **Direct Farmer-to-Consumer Marketplace**: Connect verified farmers with urban consumers  
- **Multilingual Support (Bengali & English)**: Accessible for both local farmers and urban users  
- **Nutritional Information**: Show nutrition facts and health benefits of each fruit  

### 📊 Dashboards & Order Management
- **Real-Time Analytics Dashboard**: Live insights into orders, sales, inventory, and performance  
- **Complete Order Management**: Track orders from placement to delivery  
- **Admin Dashboard**: Manage users, content, analytics, and reports  
- **Seller Dashboard**: Tools for sellers to manage products, orders, and inventory  

### 👥 User Roles & Access
- **Multi-role System (User, Seller, Admin)**: Role-based access and functionality  
- **Seller Verification**: Authenticate real farmers before allowing them to sell  

### 💳 Payments & Transactions
- **Multiple Payment Methods**: Support mobile banking, SSL Commerz, and others  
- **Dynamic Pricing**: AI-powered price predictions and seasonal forecasting  

### 🔐 Security & Authentication
- **JWT Authentication & Google OAuth**: Secure and seamless login system  
- **Input Validation & Security (Helmet, CORS, Rate Limiting)**: Protect APIs and user data 


## 🛠 Technology Stack

### Frontend
- *React 18* with TypeScript
- *Tailwind CSS* for styling
- *Vite* for build tooling
- *React Router* for navigation
- *Lucide React* for icons

### Backend
- *Node.js* with Express
- *MongoDB* with Mongoose
- *JWT* authentication
- *Passport.js* for OAuth
- *Multer* for file uploads


### Additional Services
- *Cloudinary* for image management
- *Nodemailer* for email services
- *SSL Commerz* for payments
- *Google OAuth* for authentication

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Google Gemini API key

### Environment Variables
Create a .env file in the root directory:

env
# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/fruitpanda

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
SESSION_SECRET=your-super-secret-session-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Gemini AI API
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# Email Configuration
EMAIL_FROM=noreply@fruitpanda.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Payment Gateway (SSL Commerz)
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-store-password
SSLCOMMERZ_IS_LIVE=false


### Installation

1. *Clone the repository*
bash
git clone <repository-url>
cd fruit-panda


2. *Install dependencies*
bash
npm install


3. *Start MongoDB*
bash
# If using local MongoDB
mongod


4. *Start the backend server*
bash
npm run server:dev


5. *Start the frontend development server*
bash
npm run dev


The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

### Default Admin Account
- Email: admin@fruitpanda.com
- Password: admin123


## 📱 Key Components

### Dynamic Pricing (/seasonal-forecast)
- AI-powered price predictions
- Seasonal availability calendar
- Market trend analysis
- Best time to buy recommendations

### Admin Dashboard (/admin)
- User management and verification
- Order tracking and management
- Analytics and reporting
- Content management

### Seller Dashboard (/seller-dashboard)
- Product management
- Order fulfillment
- Sales analytics
- Inventory tracking

## 🔐 Security Features

- *JWT Authentication*: Secure token-based authentication
- *Role-based Access Control*: Different permissions for different user types
- *Input Validation*: Comprehensive validation using express-validator
- *Rate Limiting*: API rate limiting to prevent abuse
- *CORS Configuration*: Proper CORS setup for security
- *Helmet.js*: Security headers for protection

## 🌐 API Endpoints

### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/auth/google - Google OAuth
- POST /api/auth/logout - User logout

### Products
- GET /api/products - Get all products
- POST /api/products - Create product (seller/admin)
- PUT /api/products/:id - Update product
- DELETE /api/products/:id - Delete product

### Orders
- GET /api/orders - Get orders
- POST /api/orders - Create order
- PATCH /api/orders/:id/status - Update order status

### Admin
- GET /api/admin/users - Get all users
- PATCH /api/admin/users/:id/role - Update user role
- GET /api/admin/dashboard/stats - Get dashboard statistics

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages

### Backend Deployment
The backend can be deployed to:
- Heroku
- Railway
- DigitalOcean
- AWS

### Database
- MongoDB Atlas (recommended for production)
- Local MongoDB for development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: fruitpanda250@gmail.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 🔄 Version History

### v1.0.0 (Current)
- Initial release with core marketplace features
- Dynamic pricing system
- Admin and seller dashboards
- Multilingual support

---

*Fruit Panda* - Connecting farmers to your table with the power of AI! 🥭🤖
