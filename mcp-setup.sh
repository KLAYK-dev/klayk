#!/bin/bash
# Drizzle MCP Server Verification & Setup Script
# Usage: ./mcp-setup.sh [--start] [--debug] [--db-url DATABASE_URL]

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_PACKAGE="$PROJECT_ROOT/packages/database"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# Parse arguments
START_SERVER=false
DEBUG_MODE=false
CUSTOM_DB_URL=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --start)
      START_SERVER=true
      shift
      ;;
    --debug)
      DEBUG_MODE=true
      shift
      ;;
    --db-url)
      CUSTOM_DB_URL="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# ============================================================================
# STEP 1: Verify Prerequisites
# ============================================================================

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  Drizzle MCP Server Setup & Verification                   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📋 STEP 1: Verifying Prerequisites...${NC}"
echo ""

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js version: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check package manager
if command -v bun &> /dev/null; then
    BUN_VERSION=$(bun --version)
    echo -e "${GREEN}✓ Bun package manager: $BUN_VERSION${NC}"
elif command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ NPM package manager: $NPM_VERSION${NC}"
fi

echo ""

# ============================================================================
# STEP 2: Check DATABASE_URL
# ============================================================================

echo -e "${YELLOW}🔧 STEP 2: Checking DATABASE_URL...${NC}"
echo ""

if [ -n "$CUSTOM_DB_URL" ]; then
    export DATABASE_URL="$CUSTOM_DB_URL"
    echo -e "${GREEN}✓ DATABASE_URL set from parameter${NC}"
elif [ -n "$DATABASE_URL" ]; then
    MASKED_URL=$(echo "$DATABASE_URL" | sed 's/password=[^@]*/password=***/g')
    echo -e "${GREEN}✓ DATABASE_URL found: $MASKED_URL${NC}"
else
    echo -e "${YELLOW}⚠ DATABASE_URL not set. Using default: postgresql://localhost:5432/klayk_dev${NC}"
    export DATABASE_URL="postgresql://localhost:5432/klayk_dev"
    echo -e "${YELLOW}! Please set correct DATABASE_URL before starting MCP server${NC}"
fi

echo ""

# ============================================================================
# STEP 3: Verify Drizzle Configuration
# ============================================================================

echo -e "${YELLOW}📄 STEP 3: Verifying Drizzle Configuration...${NC}"
echo ""

if [ -f "$DB_PACKAGE/drizzle.config.ts" ]; then
    echo -e "${GREEN}✓ drizzle.config.ts found${NC}"
    echo -e "${GRAY}  Location: $DB_PACKAGE/drizzle.config.ts${NC}"
else
    echo -e "${RED}✗ drizzle.config.ts not found!${NC}"
    exit 1
fi

echo ""

# ============================================================================
# STEP 4: Check Schema Files
# ============================================================================

echo -e "${YELLOW}📚 STEP 4: Checking Schema Files...${NC}"
echo ""

SCHEMA_DIR="$DB_PACKAGE/src/schema"
SCHEMA_FILES=(
    "admin.schema.ts"
    "analytics.schema.ts"
    "cart.schema.ts"
    "categories.schema.ts"
    "content.schema.ts"
    "inventory.schema.ts"
    "notifications.schema.ts"
    "orders.schema.ts"
    "products.schema.ts"
    "promotions.schema.ts"
    "reviews.schema.ts"
    "settings.schema.ts"
    "users.schema.ts"
    "vendors.schema.ts"
)

FOUND_COUNT=0
for file in "${SCHEMA_FILES[@]}"; do
    if [ -f "$SCHEMA_DIR/$file" ]; then
        ((FOUND_COUNT++))
    fi
done

echo -e "${GREEN}✓ Found $FOUND_COUNT/${#SCHEMA_FILES[@]} schema files${NC}"

echo ""

# ============================================================================
# STEP 5: Verify TypeScript Compilation
# ============================================================================

echo -e "${YELLOW}🔨 STEP 5: Verifying TypeScript Compilation...${NC}"
echo ""

cd "$DB_PACKAGE"
if npx tsc --noEmit 2>&1; then
    echo -e "${GREEN}✓ TypeScript compilation: PASSED (0 errors)${NC}"
else
    echo -e "${RED}✗ TypeScript compilation: FAILED${NC}"
fi
cd - > /dev/null

echo ""

# ============================================================================
# STEP 6: Display Configuration Summary
# ============================================================================

echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Configuration Summary${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${GRAY}Project Path:        $PROJECT_ROOT${NC}"
echo -e "${GRAY}Database Package:    $DB_PACKAGE${NC}"
echo -e "${GRAY}Node.js Version:     $NODE_VERSION${NC}"
MASKED_DB_URL=$(echo "$DATABASE_URL" | sed 's/password=[^@]*/password=***/g')
echo -e "${GRAY}Database URL:        $MASKED_DB_URL${NC}"
echo -e "${GRAY}Drizzle Config:      $DB_PACKAGE/drizzle.config.ts${NC}"
echo -e "${GRAY}Schema Files:        $FOUND_COUNT found${NC}"
echo ""

# ============================================================================
# STEP 7: Start MCP Server (if requested)
# ============================================================================

if [ "$START_SERVER" = true ]; then
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Starting Drizzle MCP Server${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    cd "$DB_PACKAGE"
    
    if [ "$DEBUG_MODE" = true ]; then
        echo -e "${YELLOW}🐛 Running with DEBUG enabled...${NC}"
        echo ""
        export DEBUG="drizzle-mcp:*"
        npm run db:mcp:dev
    else
        echo -e "${YELLOW}🚀 Starting MCP server...${NC}"
        echo ""
        npm run db:mcp
    fi
    
    cd - > /dev/null
else
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Next Steps${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}1. Start MCP Server:${NC}"
    echo -e "${GRAY}   ./mcp-setup.sh --start${NC}"
    echo ""
    echo -e "${YELLOW}2. Start with debug output:${NC}"
    echo -e "${GRAY}   ./mcp-setup.sh --start --debug${NC}"
    echo ""
    echo -e "${YELLOW}3. Set custom DATABASE_URL:${NC}"
    echo -e "${GRAY}   ./mcp-setup.sh --start --db-url 'postgresql://user:pass@host/db'${NC}"
    echo ""
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Setup Complete ✓${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
