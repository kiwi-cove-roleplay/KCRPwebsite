# Starts portal-api (the SFOS/FiveM database service the website talks to).
#
#   .\start-api.ps1          # dev mode with auto-reload (tsx watch)
#   .\start-api.ps1 -Prod    # compile with tsc, then run the built dist/
#
# Requires pnpm (this repo pins pnpm@9.15.9) and portal-api/.env to exist.
param(
    [switch]$Prod
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiDir = Join-Path $repoRoot "portal-api"

# pnpm on PATH?
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Error "pnpm not found on PATH. Install it (npm i -g pnpm) or enable corepack (corepack enable)."
    exit 1
}

# Config present? portal-api's config.ts throws on missing DB_USER/DB_NAME/PORTAL_API_SECRET.
$envFile = Join-Path $apiDir ".env"
if (-not (Test-Path $envFile)) {
    Write-Error "portal-api\.env not found. Copy portal-api\.env.example to portal-api\.env and fill it in."
    exit 1
}

# Dependencies installed?
if (-not (Test-Path (Join-Path $apiDir "node_modules"))) {
    Write-Host "Installing workspace dependencies (pnpm install)..." -ForegroundColor Cyan
    pnpm install
    if (-not $?) { exit 1 }
}

if ($Prod) {
    Write-Host "Building portal-api..." -ForegroundColor Cyan
    pnpm --filter sfos-portal-api build
    if (-not $?) { exit 1 }
    Write-Host "Starting portal-api (production build)..." -ForegroundColor Green
    pnpm --filter sfos-portal-api start
} else {
    Write-Host "Starting portal-api (dev, auto-reload)..." -ForegroundColor Green
    pnpm --filter sfos-portal-api dev
}
