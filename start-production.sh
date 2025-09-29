#!/bin/bash

# StrideWise Production Startup Script
echo "🏃‍♂️ Starting StrideWise in Production Mode..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep mongod > /dev/null; then
    echo "🔄 Starting MongoDB..."
    brew services start mongodb/brew/mongodb-community
    sleep 3
fi

# Build the applications if dist folders don't exist
if [ ! -d "frontend/dist" ]; then
    echo "🔨 Building frontend..."
    cd frontend && npm run build && cd ..
fi

if [ ! -d "backend/dist" ]; then
    echo "🔨 Building backend..."
    cd backend && npm run build && cd ..
fi

# Start the backend in production mode
echo "🚀 Starting backend server..."
cd backend
NODE_ENV=production node dist/server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Serve the frontend using a simple static server
echo "🌐 Starting frontend server..."
cd ../frontend
npx serve -s dist -l 3001 &
FRONTEND_PID=$!

echo ""
echo "✅ StrideWise is now running in production mode!"
echo "🌐 Frontend: http://localhost:3001"
echo "🔧 Backend API: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services..."

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down StrideWise..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped."
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID