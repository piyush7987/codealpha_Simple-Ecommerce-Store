<<<<<<< HEAD
# E-commerce Website - Complete Full-Stack Application

A modern, responsive e-commerce website built with Node.js, Express.js, MongoDB, and vanilla JavaScript.

## 🚀 Features

### Backend Features
- **User Authentication**: JWT-based authentication with secure password hashing
- **Product Management**: CRUD operations for products with categories and stock management
- **Shopping Cart**: Session-based cart management with quantity controls
- **Order Processing**: Complete order lifecycle from creation to delivery
- **User Management**: User profiles with order history
- **RESTful API**: Well-structured API endpoints with proper error handling
- **Database Integration**: MongoDB with Mongoose ODM

### Frontend Features
- **Responsive Design**: Mobile-first design that works on all devices
- **Product Catalog**: Browse products with search, filter, and pagination
- **Shopping Cart**: Add/remove items with real-time cart updates
- **User Authentication**: Login/register with form validation
- **Order Management**: View order history and track order status
- **Modern UI**: Clean, professional interface with smooth animations
- **Real-time Updates**: Dynamic content loading without page refresh

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Grid and Flexbox
- **JavaScript ES6+** - Modern JavaScript features
- **Font Awesome** - Icon library

## 📁 Project Structure

```
ecommerce-site/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection and sample data
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── productController.js # Product management
│   │   └── orderController.js   # Order processing
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Product.js          # Product schema
│   │   └── Order.js            # Order schema
│   ├── routes/
│   │   ├── auth.js             # Auth routes
│   │   ├── products.js         # Product routes
│   │   └── orders.js           # Order routes
│   ├── app.js                  # Express app configuration
│   ├── server.js               # Server startup
│   └── package.json            # Dependencies and scripts
├── frontend/
│   ├── css/
│   │   └── style.css           # Main styles
│   ├── js/
│   │   ├── auth.js             # Authentication handling
│   │   ├── products.js         # Product management
│   │   ├── cart.js             # Shopping cart
│   │   └── orders.js           # Order management
│   └── index.html              # Main HTML file
└── README.md                   # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ecommerce-site
```

2. **Set up the backend**
```bash
cd backend
npm install
```

3. **Create environment file**
Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
NODE_ENV=development
```

4. **Start MongoDB**
Make sure MongoDB is running on your system.

5. **Start the backend server**
```bash
npm start
# or for development with auto-restart
npm run dev
```

6. **Open the application**
Open your browser and navigate to `http://localhost:3000`

## 📋 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)

### Product Endpoints
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories` - Get all categories
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Order Endpoints
- `POST /api/orders` - Create new order (requires auth)
- `GET /api/orders` - Get user orders (requires auth)
- `GET /api/orders/:id` - Get single order (requires auth)
- `PUT /api/orders/:id/cancel` - Cancel order (requires auth)
- `GET /api/orders/admin/all` - Get all orders (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)

## 🎨 UI Components

### Navigation
- Responsive navigation bar with logo
- User authentication menu
- Shopping cart with item count
- Mobile-friendly dropdown menus

### Product Display
- Grid layout with responsive cards
- Product images with fallback
- Price and stock information
- Add to cart functionality
- Product detail modal

### Shopping Cart
- Item quantity controls
- Remove item functionality
- Real-time total calculation
- Checkout process

### Order Management
- Order history display
- Order status tracking
- Order cancellation
- Detailed order information

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Error handling without sensitive data exposure

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## 🎯 Key Features Explained

### User Authentication
- Secure registration and login system
- JWT tokens for session management
- Protected routes and middleware
- User profile management

### Product Management
- Dynamic product catalog
- Search and filter functionality
- Category-based organization
- Stock management
- Image handling with fallbacks

### Shopping Cart
- Persistent cart using localStorage
- Real-time updates
- Quantity controls
- Stock validation

### Order Processing
- Complete checkout flow
- Address validation
- Order confirmation
- Status tracking
- Order history

## 🚀 Deployment

### Environment Variables
Set up the following environment variables for production:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_production_jwt_secret
PORT=3000
NODE_ENV=production
```

### Production Deployment
1. Build and optimize frontend assets
2. Set up MongoDB database
3. Configure environment variables
4. Deploy to your preferred hosting platform
5. Set up domain and SSL certificate

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file
   - Verify database permissions

2. **Authentication Issues**
   - Check JWT_SECRET in environment variables
   - Verify token is being sent in requests
   - Clear browser localStorage if needed

3. **CORS Errors**
   - Ensure CORS is properly configured
   - Check if frontend and backend URLs match

4. **File Not Found Errors**
   - Verify all file paths are correct
   - Check if files exist in specified locations

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting section

## 🚀 Future Enhancements

- Payment gateway integration
- Email notifications
- Product reviews and ratings
- Admin dashboard
- Inventory management
- Wishlist functionality
- Product recommendations
- Advanced search filters
- Multi-language support
- Social media integration

---

**Built with ❤️ using modern web technologies**
=======
# codealpha_tasks
>>>>>>> c5d4b90311e774bdfe95bddb33df9edebf388121
