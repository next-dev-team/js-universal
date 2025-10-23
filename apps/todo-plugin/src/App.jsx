import React, { useState, useEffect } from 'react'
import TodoHeader from './components/TodoHeader'
import TodoInput from './components/TodoInput'
import TodoList from './components/TodoList'
import TodoFilter from './components/TodoFilter'
import TodoStats from './components/TodoStats'
import './App.css'

const STORAGE_KEY = 'todo-plugin-data'

function App() {
  const [todos, setTodos] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load todos from plugin storage on mount
  useEffect(() => {
    loadTodos()
  }, [])

  // Save todos to plugin storage whenever todos change
  useEffect(() => {
    if (!loading) {
      saveTodos()
    }
  }, [todos, loading])

  const loadTodos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (window.pluginAPI && window.pluginAPI.storage) {
        const savedTodos = await window.pluginAPI.storage.get(STORAGE_KEY)
        if (savedTodos && Array.isArray(savedTodos)) {
          setTodos(savedTodos)
        }
      } else {
        // Fallback to localStorage for development
        const savedTodos = localStorage.getItem(STORAGE_KEY)
        if (savedTodos) {
          setTodos(JSON.parse(savedTodos))
        }
      }
    } catch (err) {
      setError('Failed to load todos')
      console.error('Error loading todos:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveTodos = async () => {
    try {
      if (window.pluginAPI && window.pluginAPI.storage) {
        await window.pluginAPI.storage.set(STORAGE_KEY, todos)
      } else {
        // Fallback to localStorage for development
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
      }
    } catch (err) {
      setError('Failed to save todos')
      console.error('Error saving todos:', err)
    }
  }

  const addTodo = (text) => {
    if (!text.trim()) return

    const newTodo = {
      id: Date.now() + Math.random(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }

    setTodos(prev => [newTodo, ...prev])
  }

  const toggleTodo = (id) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id 
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    )
  }

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  const editTodo = (id, newText) => {
    if (!newText.trim()) {
      deleteTodo(id)
      return
    }

    setTodos(prev => 
      prev.map(todo => 
        todo.id === id 
          ? { ...todo, text: newText.trim() }
          : todo
      )
    )
  }

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed))
  }

  const toggleAll = () => {
    const allCompleted = todos.every(todo => todo.completed)
    setTodos(prev => 
      prev.map(todo => ({ ...todo, completed: !allCompleted }))
    )
  }

  const getFilteredTodos = () => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed)
      case 'completed':
        return todos.filter(todo => todo.completed)
      default:
        return todos
    }
  }

  const filteredTodos = getFilteredTodos()
  const activeTodosCount = todos.filter(todo => !todo.completed).length
  const completedTodosCount = todos.filter(todo => todo.completed).length

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading todos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <TodoHeader />
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      <div className="todo-container">
        <TodoInput onAddTodo={addTodo} />
        
        {todos.length > 0 && (
          <>
            <TodoFilter 
              filter={filter} 
              onFilterChange={setFilter}
              onToggleAll={toggleAll}
              allCompleted={todos.every(todo => todo.completed)}
            />
            
            <TodoList 
              todos={filteredTodos}
              onToggleTodo={toggleTodo}
              onDeleteTodo={deleteTodo}
              onEditTodo={editTodo}
            />
            
            <TodoStats 
              activeTodosCount={activeTodosCount}
              completedTodosCount={completedTodosCount}
              onClearCompleted={clearCompleted}
            />
          </>
        )}

        {todos.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No todos yet</h3>
            <p>Add your first todo above to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App