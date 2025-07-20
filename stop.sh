#!/bin/bash

# Present.ai - Stop All Local Instances
# This script stops all the running Present.ai services

echo "🛑 Stopping Present.ai Local Development Environment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to stop a service
stop_service() {
    local service_name="$1"
    local pid_file="/tmp/presentai_${service_name,,}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${YELLOW}Stopping $service_name (PID: $pid)...${NC}"
            kill "$pid"
            rm "$pid_file"
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "${RED}❌ $service_name process not found${NC}"
            rm "$pid_file"
        fi
    else
        echo -e "${YELLOW}⚠️  No PID file found for $service_name${NC}"
    fi
}

# Stop all services
stop_service "PocketBase"
stop_service "Backend"
stop_service "Upload"
stop_service "Frontend"
stop_service "Landing"
stop_service "n8n"

echo ""

# Clean up any remaining processes on the ports
echo -e "${YELLOW}🧹 Cleaning up any remaining processes...${NC}"

# Kill any remaining processes on our ports
for port in 8090 3001 5173 3030 3000 5678; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo -e "${YELLOW}Killing process on port $port...${NC}"
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
    fi
done

# Clean up log files
echo -e "${YELLOW}🗑️  Cleaning up log files...${NC}"
rm -f /tmp/presentai_*.log

echo ""
echo -e "${GREEN}🎯 All Present.ai services have been stopped!${NC}"
