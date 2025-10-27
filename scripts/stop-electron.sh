#!/bin/bash
echo "Stopping Electron processes..."
pkill -f electron 2>/dev/null
pkill -f "Super App" 2>/dev/null
echo "Electron processes stopped."
