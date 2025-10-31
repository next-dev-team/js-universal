import React from 'react'

function TodoFilter({ filter, onFilterChange, onToggleAll, allCompleted }) {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' }
  ]

  return (
    <div className="todo-filter">
      <button 
        className={`toggle-all-button ${allCompleted ? 'all-completed' : ''}`}
        onClick={onToggleAll}
        title={allCompleted ? 'Mark all as incomplete' : 'Mark all as complete'}
      >
        <span className="toggle-all-icon">
          {allCompleted ? '↻' : '✓'}
        </span>
      </button>

      <div className="filter-buttons">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            className={`filter-button ${filter === key ? 'active' : ''}`}
            onClick={() => onFilterChange(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TodoFilter