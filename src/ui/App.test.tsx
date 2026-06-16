import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
  it('renders the Shelf at the root route', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /Shelf/i })).toBeInTheDocument()
  })
})
