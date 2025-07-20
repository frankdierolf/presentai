#!/bin/bash

# Present.ai - Start All Local Instances
# This script starts all the required services for the Present.ai application

echo "🚀 Starting Present.ai Local Development Environment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    else
        return 0
    fi
}

# Function to start a service in the background
start_service() {
    local service_name="$1"
    local port="$2"
    local directory="$3"
    local command="$4"
    
    # Convert service name to lowercase for file naming
    local service_lower=$(echo "$service_name" | tr '[:upper:]' '[:lower:]')
    
    echo -e "${BLUE}Starting $service_name on port $port...${NC}"
    
    if check_port $port; then
        cd "$directory"
        $command > "/tmp/presentai_${service_lower}.log" 2>&1 &
        local pid=$!
        echo $pid > "/tmp/presentai_${service_lower}.pid"
        echo -e "${GREEN}✅ $service_name started (PID: $pid)${NC}"
    else
        echo -e "${RED}❌ Failed to start $service_name - port $port already in use${NC}"
    fi
    
    cd - > /dev/null
}

# Get the script directory to use as base path
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📍 Base directory: $SCRIPT_DIR"
echo ""

# 1. Start PocketBase (Database)
echo -e "${YELLOW}🗄️  Starting PocketBase Database...${NC}"
start_service "PocketBase" "8090" "$SCRIPT_DIR/pocketbase" "./pocketbase serve"

# Wait a moment for PocketBase to initialize
sleep 2

# 2. Start Backend API
echo -e "${YELLOW}🔧 Starting Backend API...${NC}"
start_service "Backend" "3001" "$SCRIPT_DIR/backend" "npm run dev"

# 3. Start Upload File Interface
echo -e "${YELLOW}📁 Starting Upload Interface...${NC}"
start_service "Upload" "5173" "$SCRIPT_DIR/generate_presentation/upload-file" "npm run dev"

# 4. Start Frontend Slidev
echo -e "${YELLOW}🎨 Starting Frontend Slidev...${NC}"
start_service "Frontend" "3030" "$SCRIPT_DIR/frontend" "npm run dev"

# 5. Start Landing Page
echo -e "${YELLOW}🏠 Starting Landing Page...${NC}"
start_service "Landing" "3000" "$SCRIPT_DIR/landing" "npm run dev"

# 6. Start n8n Workflows (optional)
echo -e "${YELLOW}🔄 Starting n8n Workflows...${NC}"
start_service "n8n" "5678" "$SCRIPT_DIR/generate_presentation/n8n-local" "npx n8n"

echo ""
echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo ""
echo "📋 Service URLs:"
echo -e "   ${BLUE}🗄️  PocketBase:${NC}     http://localhost:8090"
echo -e "   ${BLUE}🔧 Backend API:${NC}     http://localhost:3001"
echo -e "   ${BLUE}📁 Upload Interface:${NC} http://localhost:5173"
echo -e "   ${BLUE}🎨 Frontend Slidev:${NC}  http://localhost:3030"
echo -e "   ${BLUE}🏠 Landing Page:${NC}     http://localhost:3000"
echo -e "   ${BLUE}🔄 n8n Workflows:${NC}    http://localhost:5678"
echo ""
echo "📝 Logs are available in /tmp/presentai_*.log"
echo "🛑 To stop all services, run: ./stop.sh"
echo ""
echo -e "${GREEN}✨ Present.ai is ready! Open http://localhost:3000 to get started.${NC}"
