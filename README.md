# AI E-Commerce Assistant

A comprehensive AI-powered assistant for e-commerce platforms built with FastAPI, OpenAI, and modern web technologies.

## Features

### 🤖 AI-Powered Chat Assistant
- Natural language product search and recommendations
- Intelligent order tracking and customer support
- Intent recognition and context-aware responses
- Sentiment analysis for customer feedback

### 🛍️ E-Commerce Functionality
- Product catalog management with advanced filtering
- Order management and tracking system
- User management and authentication
- Inventory management with low-stock alerts

### 📊 Analytics & Insights
- Real-time dashboard with key metrics
- Sales trends and performance analytics
- Customer behavior insights
- AI interaction statistics
- Demand prediction based on historical data

### 🎯 Personalized Recommendations
- User-based collaborative filtering
- Product similarity recommendations
- Trending products identification
- Frequently bought together suggestions

## Technology Stack

- **Backend**: FastAPI, Python 3.8+
- **AI/ML**: OpenAI GPT-3.5, scikit-learn, pandas
- **Database**: SQLAlchemy with SQLite (easily configurable for PostgreSQL/MySQL)
- **Frontend**: Modern HTML5, CSS3, JavaScript (ES6+)
- **Authentication**: JWT tokens with bcrypt hashing
- **Additional**: Pydantic for data validation, Uvicorn ASGI server

## Quick Start

### Prerequisites
- Python 3.8 or higher
- OpenAI API key
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-ecommerce-assistant
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env file and add your OpenAI API key
   ```

5. **Initialize database and sample data**
   ```bash
   python -m app.sample_data
   ```

6. **Run the application**
   ```bash
   python -m app.main
   ```

7. **Access the application**
   - Open your browser and go to `http://localhost:8000`
   - API documentation available at `http://localhost:8000/docs`

## API Endpoints

### Chat Assistant
- `POST /api/chat/message` - Send message to AI assistant
- `GET /api/chat/recommendations/{user_id}` - Get personalized recommendations
- `POST /api/chat/sentiment` - Analyze message sentiment
- `GET /api/chat/history/{user_id}` - Get chat history

### Products
- `GET /api/products/` - List products with filtering
- `GET /api/products/{product_id}` - Get product details
- `POST /api/products/` - Create new product
- `GET /api/products/categories/list` - Get all categories
- `GET /api/products/search/suggestions` - Get search suggestions

### Orders
- `POST /api/orders/` - Create new order
- `GET /api/orders/{order_id}` - Get order details
- `GET /api/orders/user/{user_id}` - Get user orders
- `PUT /api/orders/{order_id}/status` - Update order status
- `GET /api/orders/track/{order_id}` - Track order

### Recommendations
- `GET /api/recommendations/user/{user_id}` - User recommendations
- `GET /api/recommendations/similar/{product_id}` - Similar products
- `GET /api/recommendations/trending` - Trending products
- `GET /api/recommendations/category/{category}` - Category recommendations

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/sales/trends` - Sales trends
- `GET /api/analytics/products/top-selling` - Top selling products
- `GET /api/analytics/customers/insights` - Customer insights
- `GET /api/analytics/ai-interactions/stats` - AI interaction stats

## Usage Examples

### Chat with AI Assistant
```javascript
const response = await fetch('/api/chat/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        message: "I'm looking for wireless headphones under $200",
        user_id: 1
    })
});
```

### Get Product Recommendations
```javascript
const recommendations = await fetch('/api/recommendations/user/1');
const data = await recommendations.json();
```

### Search Products
```javascript
const products = await fetch('/api/products/?search=headphones&category=Electronics&max_price=200');
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI functionality | Yes |
| `DATABASE_URL` | Database connection string | No (defaults to SQLite) |
| `PORT` | Server port | No (defaults to 8000) |
| `SECRET_KEY` | JWT secret key | No (auto-generated) |

### Database Configuration

The application uses SQLite by default but can be easily configured for PostgreSQL or MySQL:

```bash
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost/dbname

# MySQL
DATABASE_URL=mysql://user:password@localhost/dbname
```

## AI Assistant Capabilities

The AI assistant can handle various types of queries:

1. **Product Search**: "Show me wireless headphones under $200"
2. **Order Inquiries**: "What's the status of my recent order?"
3. **Recommendations**: "Suggest some products similar to my last purchase"
4. **Support**: "I have a problem with my order"
5. **Comparisons**: "Compare iPhone vs Samsung Galaxy"

## Development

### Project Structure
```
app/
├── main.py              # FastAPI application entry point
├── database.py          # Database models and configuration
├── ai_assistant.py      # AI assistant core functionality
├── sample_data.py       # Sample data generator
├── routers/             # API route handlers
│   ├── chat.py          # Chat and AI endpoints
│   ├── products.py      # Product management
│   ├── orders.py        # Order management
│   ├── recommendations.py # Recommendation engine
│   └── analytics.py     # Analytics and insights
└── static/              # Frontend assets
    └── index.html       # Main web interface
```

### Adding New Features

1. **New API Endpoints**: Add routes in appropriate router files
2. **Database Models**: Extend `database.py` with new SQLAlchemy models
3. **AI Capabilities**: Enhance `ai_assistant.py` with new intents and responses
4. **Frontend**: Modify `static/index.html` for UI changes

### Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## Deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "-m", "app.main"]
```

### Production Considerations
- Use PostgreSQL or MySQL for production database
- Set up Redis for caching and session management
- Configure proper environment variables
- Use a reverse proxy (nginx) for static files
- Set up monitoring and logging
- Implement rate limiting for API endpoints

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation at `/docs`
- Review the example usage in the code

## Roadmap

- [ ] Advanced machine learning recommendations
- [ ] Multi-language support
- [ ] Voice interface integration
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with payment gateways
- [ ] Social commerce features