import React from 'react'

function TodoStats({ activeTodosCount, completedTodosCount, onClearCompleted }) {
  const totalTodos = activeTodosCount + completedTodosCount

  return (
    <div className="todo-stats">
      <div className="stats-info">
        <span className="stats-text">
          {activeTodosCount} of {totalTodos} remaining
        </span>
      </div>

      {completedTodosCount > 0 && (
        <button 
          className="clear-completed-button"
          onClick={onClearCompleted}
        >
          Clear completed ({completedTodosCount})
        </button>
      )}
    </div>
  )
}

export default TodoStats