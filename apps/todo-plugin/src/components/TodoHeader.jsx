import React from "react";

function TodoHeader() {
  // Debug: Log what's available on the window object
  console.log("[Todo Plugin] Window object keys:", Object.keys(window));
  console.log("[Todo Plugin] window.pluginAPI:", window.pluginAPI);
  
  const pluginId = window?.pluginAPI?.getPluginId ? window.pluginAPI.getPluginId() : "API not available";
  console.log("[Todo Plugin] Plugin ID from API:", pluginId);

  return (
    <header className="todo-header">
      <h1 className="todo-title">
        <span className="todo-icon">✓</span>
        Todo App - {pluginId}
      </h1>
      <p className="todo-subtitle">Stay organized and get things done</p>
    </header>
  );
}

export default TodoHeader;
