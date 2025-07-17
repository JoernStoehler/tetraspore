import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the Tetraspore title', () => {
    render(<App />)
    const title = screen.getByText('Tetraspore')
    expect(title).toBeInTheDocument()
  })

  it('renders game description', () => {
    render(<App />)
    const description = screen.getByText('Evolution & Civilization Game')
    expect(description).toBeInTheDocument()
  })

  it('renders both game buttons', () => {
    render(<App />)
    const newGameButton = screen.getByText('New Game')
    const loadGameButton = screen.getByText('Load Game')
    
    expect(newGameButton).toBeInTheDocument()
    expect(loadGameButton).toBeInTheDocument()
  })

  it('displays version number', () => {
    render(<App />)
    const version = screen.getByText(/v0\.0\.1/)
    expect(version).toBeInTheDocument()
  })
})