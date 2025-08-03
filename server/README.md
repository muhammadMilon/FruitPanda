# Fruit Panda Server

Backend server for the Fruit Panda e-commerce platform.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/fruit-panda

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Google OAuth Configuration (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Fruit Panda <your-email@gmail.com>

# Stripe Configuration (optional)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 3. Start MongoDB
Make sure MongoDB is running on your system.

### 4. Run the Server

#### Development Mode
```bash
npm run dev
# or
npm run server:dev
```

#### Production Mode
```bash
npm start
```

### 5. Seed Data (Optional)
```bash
npm run seed
```

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm run server:dev` - Same as dev (alias)
- `npm run seed` - Seed the database with sample products

## API Endpoints

The server provides the following API endpoints:

- `/api/auth` - Authentication routes
- `/api/users` - User management
- `/api/products` - Product management
- `/api/orders` - Order management
- `/api/admin` - Admin routes
- `/api/blog` - Blog management
- `/api/contact` - Contact form
- `/api/payments` - Payment processing

## Features

- User authentication with JWT
- Google OAuth integration
- Product management
- Order processing
- Payment integration with Stripe
- Email notifications
- File uploads
- Admin dashboard
- Blog system
- Contact form handling

## Dependencies

- Express.js - Web framework
- MongoDB/Mongoose - Database
- Passport.js - Authentication
- JWT - Token-based auth
- Stripe - Payment processing
- Nodemailer - Email sending
- Multer - File uploads
- Cloudinary - Image hosting
- And more...

## Security Features

- Helmet.js for security headers
- Rate limiting
- CORS configuration
- Input validation
- Password hashing
- JWT token authentication 