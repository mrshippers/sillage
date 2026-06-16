import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ShelfPage } from './ShelfPage'
import { createCatalogue } from '../../domain/catalogue'
import { SEED_SCENTS } from '../../domain/catalogue.seed'

function renderShelf() {
  const cat = createCatalogue(SEED_SCENTS)
  return render(<MemoryRouter><ShelfPage catalogue={cat} /></MemoryRouter>)
}

describe('ShelfPage', () => {
  it('lists all scents', () => {
    renderShelf()
    expect(screen.getAllByTestId('scent-row').length).toBe(15)
  })
  it('filters by search query', async () => {
    renderShelf()
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'noir')
    expect(screen.getAllByTestId('scent-row').length).toBe(1)
    expect(screen.getByText('Noir')).toBeInTheDocument()
  })
  it('filters by family when a chip is clicked', async () => {
    renderShelf()
    await userEvent.click(screen.getByRole('button', { name: 'woody' }))
    const rows = screen.getAllByTestId('scent-row')
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.length).toBeLessThan(15)
  })
})
