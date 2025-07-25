# AI Shopping Assistant - E-commerce Platform

A comprehensive AI-powered e-commerce platform with intelligent product recommendations, real-time chat support, and modern user experience.

## Features

### 🤖 AI-Powered Features
- **Smart Chat Assistant**: Real-time AI chatbot for customer support and product recommendations
- **Intelligent Product Recommendations**: Personalized suggestions based on user preferences and behavior
- **AI-Enhanced Search**: Smart search with auto-suggestions and intent detection
- **Automated Customer Support**: 24/7 AI assistance for common queries

### 🛍️ E-commerce Functionality
- **Product Catalog**: Browse products with advanced filtering and sorting
- **User Authentication**: Secure login/registration system
- **Shopping Cart**: Add/remove products with persistent storage
- **Order Management**: Track orders with real-time status updates
- **User Profiles**: Personalized preferences and order history

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with beautiful animations
- **Real-time Chat Widget**: Minimizable chat interface with typing indicators
- **Interactive Product Cards**: Hover effects and smooth transitions
- **Modal-based Product Details**: Rich product information display

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **Socket.IO** for real-time communication
- **OpenAI API** integration for AI features
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **Vanilla JavaScript** with modern ES6+ features
- **CSS Grid & Flexbox** for responsive layouts
- **Font Awesome** icons
- **Google Fonts** (Inter)

### AI & External Services
- **OpenAI GPT** for chat responses (with fallback mock responses)
- **Intent Detection** for understanding user queries
- **Recommendation Engine** based on collaborative filtering

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-ai-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key_here  # Optional - will use mock responses if not provided
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Demo Login
Use these credentials to test the application:
- **Email**: demo@example.com
- **Password**: demo123

## API Endpoints

### AI Routes (`/api/ai`)
- `POST /chat` - Send message to AI assistant
- `POST /recommendations` - Get personalized product recommendations
- `POST /search` - AI-enhanced product search
- `POST /intent` - Detect user intent from message

### Product Routes (`/api/products`)
- `GET /` - Get all products with filtering
- `GET /:id` - Get single product details
- `GET /:id/recommendations` - Get product-based recommendations
- `GET /trending/now` - Get trending products
- `POST /compare` - Compare multiple products

### User Routes (`/api/users`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile/:id` - Get user profile
- `PUT /preferences/:id` - Update user preferences

### Order Routes (`/api/orders`)
- `GET /user/:userId` - Get user orders
- `GET /:orderId` - Get specific order
- `GET /:orderId/track` - Track order status
- `POST /` - Create new order

## Architecture

### Real-time Communication
- Socket.IO handles real-time chat between users and AI
- Automatic reconnection and error handling
- Room-based chat sessions for user isolation

### AI Integration
- OpenAI GPT integration with fallback responses
- Context-aware conversations with message history
- Intent detection for better user experience
- Smart product recommendations based on user behavior

### Data Management
- In-memory data storage for demo purposes
- Persistent user sessions with localStorage
- Shopping cart persistence across sessions

## Customization

### Adding New Products
Edit the `products` array in `/routes/products.js`:

```javascript
{
  id: 6,
  name: "Your Product Name",
  price: 99.99,
  category: "Category",
  rating: 4.5,
  // ... other properties
}
```

### Customizing AI Responses
Modify the system prompt in `/routes/ai.js`:

```javascript
{
  role: 'system',
  content: `Your custom AI assistant instructions here...`
}
```

### Styling Customization
Main styles are in `/public/styles.css`. Key CSS custom properties:

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --error-color: #ef4444;
}
```

## Production Deployment

### Environment Variables
Set these in production:
```env
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=your_production_openai_key
JWT_SECRET=your_secure_jwt_secret
MONGODB_URI=your_mongodb_connection_string  # If using MongoDB
```

### Build Process
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Development

### Project Structure
```
├── server.js              # Main server file
├── routes/                 # API route handlers
│   ├── ai.js              # AI-related endpoints
│   ├── products.js        # Product management
│   ├── users.js           # User authentication
│   └── orders.js          # Order management
├── public/                # Static frontend files
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles
│   └── script.js          # Frontend JavaScript
├── package.json           # Dependencies and scripts
└── .env.example          # Environment variables template
```

### Adding New Features

1. **Backend API**: Add routes in appropriate `/routes/*.js` file
2. **Frontend UI**: Update `/public/index.html` and `/public/styles.css`
3. **JavaScript Logic**: Add functions to `/public/script.js`
4. **Real-time Features**: Use Socket.IO events in `server.js`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation above
- Review the code comments for implementation details

---

**Built with ❤️ using modern web technologies and AI**