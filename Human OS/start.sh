#!/bin/bash

# Human OS Startup Script
# Starts both the backend (Go) and frontend (React) servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}       Human OS Startup Script         ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down Human OS...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}Human OS stopped.${NC}"
    exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Check for required tools
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v go &> /dev/null; then
    echo -e "${RED}Error: Go is not installed. Please install Go 1.21 or higher.${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js 18 or higher.${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed. Please install npm.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites found${NC}"
echo ""

# Setup backend environment
echo -e "${YELLOW}Setting up backend...${NC}"
cd "$SCRIPT_DIR"

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from .env.example${NC}"
    else
        echo -e "${YELLOW}Warning: No .env.example found, backend will use defaults${NC}"
    fi
else
    echo -e "${GREEN}✓ Backend .env exists${NC}"
fi

# Install Go dependencies
echo -e "${YELLOW}Installing Go dependencies...${NC}"
go mod tidy
echo -e "${GREEN}✓ Go dependencies ready${NC}"
echo ""

# Setup frontend environment
echo -e "${YELLOW}Setting up frontend...${NC}"
cd "$SCRIPT_DIR/frontend"

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created frontend .env from .env.example${NC}"
    else
        # Create default frontend .env
        echo "VITE_API_URL=http://localhost:8080/api/v1" > .env
        echo -e "${GREEN}✓ Created frontend .env with defaults${NC}"
    fi
else
    echo -e "${GREEN}✓ Frontend .env exists${NC}"
fi

# Install npm dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies (this may take a moment)...${NC}"
    npm install
    echo -e "${GREEN}✓ npm dependencies installed${NC}"
else
    echo -e "${GREEN}✓ npm dependencies already installed${NC}"
fi
echo ""

# Start backend
echo -e "${BLUE}Starting backend server...${NC}"
cd "$SCRIPT_DIR"
go run cmd/api/main.go &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID) on http://localhost:8080${NC}"

# Give backend a moment to start
sleep 2

# Check if backend is still running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}Error: Backend failed to start${NC}"
    exit 1
fi

# Start frontend
echo -e "${BLUE}Starting frontend server...${NC}"
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID) on http://localhost:3000${NC}"
echo ""

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Human OS is running!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "  Backend:  ${YELLOW}http://localhost:8080${NC}"
echo -e "  Frontend: ${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "Press ${RED}Ctrl+C${NC} to stop both servers"
echo ""

# Wait for both processes
wait
