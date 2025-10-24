@echo off
REM JS Universal Monorepo Setup Script for Windows
REM This script ensures proper setup for new developers

echo 🚀 Setting up JS Universal Monorepo...

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    exit /b 1
)

echo [SUCCESS] Node.js is installed

REM Check if pnpm is installed
echo [INFO] Checking pnpm installation...
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] pnpm is not installed. Installing pnpm...
    npm install -g pnpm@latest
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install pnpm
        exit /b 1
    )
    echo [SUCCESS] pnpm installed successfully
) else (
    echo [SUCCESS] pnpm is installed
)

REM Install dependencies
echo [INFO] Installing dependencies with pnpm...
pnpm install --frozen-lockfile
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

REM Generate Prisma client
echo [INFO] Generating Prisma client...
pnpm run db:generate
if %errorlevel% neq 0 (
    echo [WARNING] Prisma client generation failed, but continuing...
)

REM Run postinstall scripts
echo [INFO] Running postinstall scripts...
pnpm run postinstall
if %errorlevel% neq 0 (
    echo [WARNING] Postinstall scripts failed, but continuing...
)

echo [SUCCESS] 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo   1. Run 'pnpm run dev' to start development
echo   2. Run 'pnpm run build:workspace' to build all packages
echo   3. Run 'pnpm run test:workspace' to run tests
echo.
echo 📚 Available commands:
echo   pnpm run dev              - Start development server
echo   pnpm run build:workspace  - Build all packages
echo   pnpm run test:workspace   - Run all tests
echo   pnpm run lint:workspace   - Lint all packages
echo   pnpm run watch            - Watch mode for development
echo.
echo ⚠️  Important: Always use 'pnpm' instead of 'npm' or 'yarn' in this project!
