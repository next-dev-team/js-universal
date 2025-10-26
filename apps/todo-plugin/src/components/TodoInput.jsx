import React, { useState } from 'react'

function TodoInput({ onAddTodo }) {
  const [inputValue, setInputValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onAddTodo(inputValue)
      setInputValue('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="todo-input-form">
      <div className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="What needs to be done?"
          className="todo-input"
          autoFocus
        />
        <button 
          type="submit" 
          className="add-button"
          disabled={!inputValue.trim()}
        >
          <span className="add-icon">+</span>
        </button>
      </div>
    </form>
  )
}

export default TodoInput