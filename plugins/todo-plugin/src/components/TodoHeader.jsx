import React from 'react'

function TodoHeader() {
  return (
    <header className="todo-header">
      <h1 className="todo-title">
        <span className="todo-icon">✓</span>
        Todo App
      </h1>
      <p className="todo-subtitle">Stay organized and get things done</p>
    </header>
  )
}

export default TodoHeader