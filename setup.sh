#!/bin/bash

echo "🤖 Setting up AI E-Commerce Assistant..."

# Check if Python 3.8+ is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install fastapi uvicorn[standard] pydantic openai python-dotenv httpx sqlalchemy jinja2 python-multipart aiofiles PyJWT bcrypt passlib[bcrypt] pandas scikit-learn

# Initialize database
echo "🗄️  Initializing database..."
python init_db.py

# Create sample data
echo "📊 Creating sample data..."
python -m app.sample_data

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the server:"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --host 0.0.0.0 --port 8000"
echo ""
echo "🌐 Then open: http://localhost:8000"
echo ""
echo "📝 Note: To use OpenAI features, set your API key in .env file:"
echo "   OPENAI_API_KEY=your_api_key_here"