import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

console.log("[main.tsx] Starting React app");

// Check if electronAPI is available
if (window.electronAPI) {
  console.log("[main.tsx] window.electronAPI is available");
} else {
  console.log("[main.tsx] window.electronAPI is NOT available");
}

// Check DOM ready state
console.log("[main.tsx] DOM ready state:", document.readyState);

// Check if root element exists
const rootElement = document.getElementById("root");
console.log("[main.tsx] Root element found:", !!rootElement);

if (rootElement) {
  try {
    console.log("[main.tsx] Creating React root");
    const root = createRoot(rootElement);
    console.log("[main.tsx] React root created");
    
    // Import App component dynamically to catch import errors
    console.log("[main.tsx] Importing App component");
    import("./app").then((AppModule) => {
      console.log("[main.tsx] App component imported successfully");
      const App = AppModule.default;
      
      root.render(
        <StrictMode>
          <App />
        </StrictMode>
      );
      console.log("[main.tsx] React app rendered");
    }).catch((error) => {
      console.error("[main.tsx] Error importing App component:", error);
    });
  } catch (error) {
    console.error("[main.tsx] Error creating React root:", error);
  }
} else {
  console.error("[main.tsx] Root element not found!");
}
