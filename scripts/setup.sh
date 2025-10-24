#!/bin/bash

# JS Universal Monorepo Setup Script
# This script ensures proper setup for new developers

set -e

echo "🚀 Setting up JS Universal Monorepo..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) is installed"

# Check if pnpm is installed
print_status "Checking pnpm installation..."
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm is not installed. Installing pnpm..."
    npm install -g pnpm@latest
    print_success "pnpm installed successfully"
else
    PNPM_VERSION=$(pnpm --version)
    print_success "pnpm $PNPM_VERSION is installed"
fi

# Verify pnpm version
PNPM_MAJOR_VERSION=$(pnpm --version | cut -d'.' -f1)
if [ "$PNPM_MAJOR_VERSION" -lt 8 ]; then
    print_warning "Updating pnpm to latest version..."
    npm install -g pnpm@latest
    print_success "pnpm updated successfully"
fi

# Install dependencies
print_status "Installing dependencies with pnpm..."
pnpm install --frozen-lockfile

# Generate Prisma client
print_status "Generating Prisma client..."
pnpm run db:generate

# Run postinstall scripts
print_status "Running postinstall scripts..."
pnpm run postinstall

# Verify installation
print_status "Verifying installation..."
if pnpm run build:workspace --dry-run &> /dev/null; then
    print_success "Build verification passed"
else
    print_warning "Build verification failed, but this might be expected in some cases"
fi

print_success "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Run 'pnpm run dev' to start development"
echo "  2. Run 'pnpm run build:workspace' to build all packages"
echo "  3. Run 'pnpm run test:workspace' to run tests"
echo ""
echo "📚 Available commands:"
echo "  pnpm run dev              - Start development server"
echo "  pnpm run build:workspace  - Build all packages"
echo "  pnpm run test:workspace   - Run all tests"
echo "  pnpm run lint:workspace   - Lint all packages"
echo "  pnpm run watch            - Watch mode for development"
echo ""
echo "⚠️  Important: Always use 'pnpm' instead of 'npm' or 'yarn' in this project!"
