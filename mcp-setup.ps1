# Drizzle MCP Server Verification & Setup Script
# Usage: .\mcp-setup.ps1

param(
    [switch]$Start,
    [switch]$Debug,
    [string]$DatabaseUrl
)

$projectRoot = Split-Path -Parent $MyInvocation.MyCommandPath
$dbPackage = Join-Path $projectRoot "packages\database"

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Drizzle MCP Server Setup & Verification                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# STEP 1: Verify Prerequisites
# ============================================================================

Write-Host "📋 STEP 1: Verifying Prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js version
$nodeVersion = node --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check npm/bun
$bunVersion = bun --version 2>$null
$npmVersion = npm --version 2>$null

if ($bunVersion) {
    Write-Host "✓ Bun package manager: $bunVersion" -ForegroundColor Green
}
if ($npmVersion) {
    Write-Host "✓ NPM package manager: $npmVersion" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# STEP 2: Check DATABASE_URL
# ============================================================================

Write-Host "🔧 STEP 2: Checking DATABASE_URL..." -ForegroundColor Yellow
Write-Host ""

if ($DatabaseUrl) {
    $env:DATABASE_URL = $DatabaseUrl
    Write-Host "✓ DATABASE_URL set from parameter: $DatabaseUrl" -ForegroundColor Green
} elseif ($env:DATABASE_URL) {
    Write-Host "✓ DATABASE_URL found: $($env:DATABASE_URL -replace '(password)[=:].*@', '$1=***@')" -ForegroundColor Green
} else {
    Write-Host "⚠ DATABASE_URL not set. Using default: postgresql://localhost:5432/klayk_dev" -ForegroundColor Yellow
    $env:DATABASE_URL = "postgresql://localhost:5432/klayk_dev"
    Write-Host "! Please set correct DATABASE_URL before starting MCP server" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# STEP 3: Verify Drizzle Configuration
# ============================================================================

Write-Host "📄 STEP 3: Verifying Drizzle Configuration..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "$dbPackage\drizzle.config.ts") {
    Write-Host "✓ drizzle.config.ts found" -ForegroundColor Green
    Write-Host "  Location: $dbPackage\drizzle.config.ts" -ForegroundColor Gray
} else {
    Write-Host "✗ drizzle.config.ts not found!" -ForegroundColor Red
    exit 1
}

if (Test-Path "$dbPackage\package.json") {
    $packageJson = Get-Content "$dbPackage\package.json" | ConvertFrom-Json
    if ($packageJson.scripts.'db:mcp') {
        Write-Host "✓ NPM scripts configured:" -ForegroundColor Green
        Write-Host "  - db:mcp: $($packageJson.scripts.'db:mcp')" -ForegroundColor Gray
        Write-Host "  - db:mcp:dev: $($packageJson.scripts.'db:mcp:dev')" -ForegroundColor Gray
    }
}

Write-Host ""

# ============================================================================
# STEP 4: Check Schema Files
# ============================================================================

Write-Host "📚 STEP 4: Checking Schema Files..." -ForegroundColor Yellow
Write-Host ""

$schemaDir = "$dbPackage\src\schema"
$schemaFiles = @(
    "admin.schema.ts",
    "analytics.schema.ts",
    "cart.schema.ts",
    "categories.schema.ts",
    "content.schema.ts",
    "inventory.schema.ts",
    "notifications.schema.ts",
    "orders.schema.ts",
    "products.schema.ts",
    "promotions.schema.ts",
    "reviews.schema.ts",
    "settings.schema.ts",
    "users.schema.ts",
    "vendors.schema.ts"
)

$foundCount = 0
foreach ($file in $schemaFiles) {
    if (Test-Path "$schemaDir\$file") {
        $foundCount++
    }
}

Write-Host "✓ Found $foundCount/$($schemaFiles.Count) schema files" -ForegroundColor Green

Write-Host ""

# ============================================================================
# STEP 5: Verify TypeScript Compilation
# ============================================================================

Write-Host "🔨 STEP 5: Verifying TypeScript Compilation..." -ForegroundColor Yellow
Write-Host ""

Push-Location $dbPackage
$tsOutput = & npx tsc --noEmit 2>&1
Pop-Location

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ TypeScript compilation: PASSED (0 errors)" -ForegroundColor Green
} else {
    Write-Host "✗ TypeScript compilation: FAILED" -ForegroundColor Red
    Write-Host $tsOutput
}

Write-Host ""

# ============================================================================
# STEP 6: Display Configuration Summary
# ============================================================================

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Configuration Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Project Path:        $projectRoot" -ForegroundColor Gray
Write-Host "Database Package:    $dbPackage" -ForegroundColor Gray
Write-Host "Node.js Version:     $nodeVersion" -ForegroundColor Gray
Write-Host "Database URL:        $($env:DATABASE_URL -replace '(password)[=:].*@', '$1=***@')" -ForegroundColor Gray
Write-Host "Drizzle Config:      $dbPackage\drizzle.config.ts" -ForegroundColor Gray
Write-Host "Schema Files:        $foundCount found" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# STEP 7: Start MCP Server (if requested)
# ============================================================================

if ($Start) {
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  Starting Drizzle MCP Server" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    
    Push-Location $dbPackage
    
    if ($Debug) {
        Write-Host "🐛 Running with DEBUG enabled..." -ForegroundColor Yellow
        Write-Host ""
        $env:DEBUG = "drizzle-mcp:*"
        & npm run db:mcp:dev
    } else {
        Write-Host "🚀 Starting MCP server..." -ForegroundColor Yellow
        Write-Host ""
        & npm run db:mcp
    }
    
    Pop-Location
} else {
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  Next Steps" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. Start MCP Server:" -ForegroundColor Yellow
    Write-Host "   .\mcp-setup.ps1 -Start" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Start with debug output:" -ForegroundColor Yellow
    Write-Host "   .\mcp-setup.ps1 -Start -Debug" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Set custom DATABASE_URL:" -ForegroundColor Yellow
    Write-Host "   .\mcp-setup.ps1 -DatabaseUrl 'postgresql://user:pass@host/db'" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Setup Complete ✓" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
