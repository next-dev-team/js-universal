# Operational Guidelines: STRICT ADHERENCE REQUIRED

### Tools & Context & MCP

- **Task Management:** Use `TaskMgt mcp` for medium-sized tasks.
- **External Queries:** For queries related to external libraries or general knowledge, use `context7`.

## Development Environment

- **Root Project Installation/Run Command:** Navigate to the `app` directory (`cd app`) and use `yarn` or just use any .sh file in the root
- **Package Manager:** Always use `yarn` for installing dependencies and managing packages.
- **Starting Development:** Use `./dev.sh` or `setup.sh` to start the development server.
- **Testing:** Use `./test.sh` to run tests.

## Project Overview

A project launcher that replaces itself with the chosen IDE is much more efficient than embedding. This approach eliminates the performance overhead while solving your workflow problem perfectly.

Benefits of This Approach
✅ Zero performance overhead - launcher closes when IDE opens
✅ Seamless transition - appears at same position
✅ Native IDE experience - no embedding limitations
✅ Memory efficient - only one app running at a time
✅ Fast switching - quick project selection
✅ Extensible - easy to add new IDEs

## Tech Stack

[x] Frontend: ElectronJs, React, Typescript, Zustand
[x] Backend: Electron ipc
[] Database: better-sqlite3

Implementation Strategy

1. [] Project Launcher + Position Replacement
2. [] IDE Auto-Detection
3. [] Enhanced Project Management
4. [] Workspace Management
5. [] Smart UI with Quick Actions
6. [] Project Templates or stater
