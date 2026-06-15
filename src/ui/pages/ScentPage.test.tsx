import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ScentPage } from './ScentPage'
import { createCatalogue } from '../../domain/catalogue'
import { createWardrobe } from '../../domain/wardrobe'
import { SEED_SCENTS } from '../../domain/catalogue.seed'

function memoryStorage(): Storage {
  const m = new Map<string, string>()
  return { getItem: k => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v),
    removeItem: k => void m.delete(k), clear: () => m.clear(),
    key: i => [...m.keys()][i] ?? null, get length() { return m.size } } as Storage
}

function renderAt(id: string) {
  const cat = createCatalogue(SEED_SCENTS)
  const wardrobe = createWardrobe(memoryStorage())
  wardrobe.add('aesop-hwyl', 'owned')
  return render(
    <MemoryRouter initialEntries={[`/scent/${id}`]}>
      <Routes>
        <Route path="/scent/:id" element={<ScentPage catalogue={cat} wardrobe={wardrobe} />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ScentPage', () => {
  it('shows the scent name and family', () => {
    renderAt('tomford-noir')
    expect(screen.getByRole('heading', { name: 'Noir' })).toBeInTheDocument()
    expect(screen.getByText(/Tom Ford/)).toBeInTheDocument()
  })
  it('renders accords', () => {
    renderAt('tomford-noir')
    expect(screen.getByText(/leather/i)).toBeInTheDocument()
  })
  it('suggests a pairing from the wardrobe', () => {
    renderAt('tomford-noir')
    expect(screen.getByText('Hwyl')).toBeInTheDocument()
  })
  it('shows a not-found message for unknown ids', () => {
    renderAt('does-not-exist')
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })
})
