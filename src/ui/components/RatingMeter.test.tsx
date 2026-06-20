import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RatingMeter } from './RatingMeter'

describe('RatingMeter', () => {
  it('shows the score out of 10', () => {
    render(<RatingMeter score={8.4} />)
    expect(screen.getByText('8.4')).toBeInTheDocument()
    expect(screen.getByLabelText('Sillage score 8.4 out of 10')).toBeInTheDocument()
  })
  it('renders an em dash when unrated', () => {
    render(<RatingMeter score={undefined} />)
    expect(screen.getByText('-')).toBeInTheDocument()
  })
})
