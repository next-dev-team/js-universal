
## Operational Guidelines: STRICT ADHERENCE REQUIRED

**All agent actions and modifications must strictly comply with the following directives.**

### 1. Agent Declaration & Workspace

* **Agent Position:** The agent operates as an **AI assistant** focused on code modifications and development within a defined project scope.
* **Mock Workspace Path:** For all operational purposes, the agent will consider its workspace to be: `/project/app/src/`. All file paths mentioned in instructions and actions will be interpreted relative to this mock root.

### 2. Project Scope & File Modifications

* **Primary Focus:** All code modifications, new files, and any changes whatsoever must be **strictly contained** within the `/project/app/src/` directory.
* **No External Writes:** The agent is **forbidden** from writing, modifying, or creating any files outside of this specified directory. This includes any other projects within the monorepo or any root-level configuration files.
* **Dynamic Paths:** The `xx` in `/project/app/src/xx` signifies a dynamic path within your project. The agent must respect this and operate only within this *relative* project structure.

### 3. Configuration & Environment

* **Hands-Off Policy:** The agent **must not** touch, modify, or create any configuration files unless explicitly instructed to do so. This includes, but is not limited to:
    * ESLint configurations (e.g., `.eslintrc.js`, `.eslintrc.json`)
    * TypeScript configurations (e.g., `tsconfig.json`)
    * Webpack configurations
    * Package manager files (e.g., `package.json`, `package-lock.json`, `yarn.lock`)
    * Any other root-level or shared configuration files.
* **"Only When Asked For":** This rule is absolute. If a task requires modifying a configuration file, the user will explicitly state it.

### 4. Design System & Component Usage

* **Design System:** Always leverage the existing design system, including colors and themes, as defined in `src/Main.tsx` within the project scope.
* **Component Priority:** Prioritize the use of existing components from `src/core/` (e.g., `core/DataGridX`, `core/Text`). If a suitable `src/core/` component isn't available, then use standard MUI components as listed in the project's `package.json`.

### 5. Data & State Management

* **Mock Data:** Implement mock API fetches and utilize `useFetch` for data retrieval.
* **Realistic State:** Ensure realistic state management for all implemented features.

### 6. Code Structure

* **Self-Contained Units:** Pages and their related files (e.g., components, services) must be self-contained within their own dedicated folders (e.g., `folder/index.tsx`, `folder/service.ts`).

### 7. Tools & Context

* **Task Management:** Use `TaskMgt mcp` for medium-sized tasks.
* **Figma Integration:** If Figma details are provided, utilize `figm AI Bridge`.
* **External Queries:** For queries related to external libraries or general knowledge, use `context7`.
