import React, { useState } from 'react'

function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(todo.text)

  const handleEdit = () => {
    setIsEditing(true)
    setEditValue(todo.text)
  }

  const handleSave = () => {
    onEdit(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(todo.text)
    setIsEditing(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <button 
          className={`toggle-button ${todo.completed ? 'checked' : ''}`}
          onClick={onToggle}
          aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {todo.completed && <span className="checkmark">✓</span>}
        </button>

        {isEditing ? (
          <div className="edit-container">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={handleSave}
              className="edit-input"
              autoFocus
            />
          </div>
        ) : (
          <div 
            className="todo-text"
            onDoubleClick={handleEdit}
            title="Double-click to edit"
          >
            {todo.text}
          </div>
        )}
      </div>

      <div className="todo-actions">
        {!isEditing && (
          <>
            <button 
              className="edit-button"
              onClick={handleEdit}
              aria-label="Edit todo"
            >
              ✏️
            </button>
            <button 
              className="delete-button"
              onClick={onDelete}
              aria-label="Delete todo"
            >
              🗑️
            </button>
          </>
        )}
        
        {isEditing && (
          <>
            <button 
              className="save-button"
              onClick={handleSave}
              aria-label="Save changes"
            >
              ✓
            </button>
            <button 
              className="cancel-button"
              onClick={handleCancel}
              aria-label="Cancel editing"
            >
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default TodoItem