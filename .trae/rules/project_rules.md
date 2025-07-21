# Operational Guidelines: STRICT ADHERENCE REQUIRED

## Abbreviation

:abb_ls: mean list summary of all ## Abbreviation :rule - mean must follow rule Guidelines to make sure project work as expected :rule_ls - mean list summary of rules :rule_improve - mean I want you to help improve this rule file based on current context, especially when encountering and resolving issues.

- eg. usage :rule install antd lib
- mean you read rules and will know I use yarn as package manager, so you must use yarn to install lib

:c7 - mean use context7 MCP

- usage eg. :c7 antd button type

:task_mgt_start - mean use Task Manager MCP to continue todo in tasks.json then update check in ## Project Feature / Roadmap :task_mgt_ls - mean use Task Manager MCP to list all task with status :task_mgt_sync - mean use Task Manager MCP to check code and status is sync with tasks.json, if not, update status (not code) accordingly

:fix_log - mean collect info log about current terminal running log and fix all issue :start_dev - mean run ./dev.sh :restart - mean run ./restart.sh just kill and re-run that it's

## Tools & Context & MCP

- **Task Management:** Use `TaskMgt mcp` for medium-sized tasks.
- **External Queries:** For queries related to external libraries or general knowledge, use `context7`.

## Development Environment

- **Root Project Installation/Run Command:** Navigate to the `app` directory (`cd app`) and use `yarn` or just use any .sh file in the root
- **Package Manager:** Always use `yarn` for installing dependencies and managing packages.
- **Starting Development:** Use `./dev.sh` or `setup.sh` to start the development server.
- **Testing:** Use `./test.sh` to run tests.

## Project Overview

A project launcher that replaces itself with the chosen IDE is much more efficient than embedding. This approach eliminates the performance overhead while solving your workflow problem perfectly.

## Project Feature / Roadmap

Benefits of This Approach

- ✅ Zero performance overhead - launcher closes when IDE opens
- ✅ Seamless transition - appears at same position

- ✅ Native IDE experience - no embedding limitations
- ✅ Memory efficient - only one app running at a time
- ✅ Fast switching - quick project selection
- ✅ Extensible - easy to add new IDEs

## Tech Stack

Already setup tech stack, just need to focus on implementation

- [x] Frontend: ElectronJs, React, Typescript, Zustand, ahookjs
- [x] Backend: Electron ipc
- [x] Database: better-sqlite3

Implementation Strategy

1. [] Project Launcher
2. [] Enhanced Project Management
3. [] Workspace Management
4. [] Smart UI with Quick Actions
5. [] Project Templates or stater
