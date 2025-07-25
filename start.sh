#!/bin/bash

echo "🚀 Starting AI E-Commerce Assistant..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run ./setup.sh first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Start the server
echo "🌐 Server starting at http://localhost:8000"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload