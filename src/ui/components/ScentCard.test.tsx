import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScentCard } from './ScentCard'
import { SEED_SCENTS } from '../../domain/catalogue.seed'

const noir = SEED_SCENTS.find(s => s.id === 'tomford-noir')!

describe('ScentCard', () => {
  it('shows brand and name', () => {
    render(<ScentCard scent={noir} />)
    expect(screen.getByText('Tom Ford')).toBeInTheDocument()
    expect(screen.getByText('Noir')).toBeInTheDocument()
  })
  it('lists notes grouped by layer in top, heart, base order', () => {
    render(<ScentCard scent={noir} />)
    const labels = screen.getAllByTestId('layer-label').map(n => n.textContent)
    expect(labels).toEqual(['Top', 'Heart', 'Base'])
  })
})
