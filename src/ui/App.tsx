import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { createCatalogue } from '../domain/catalogue'
import { createWardrobe } from '../domain/wardrobe'
import { SEED_SCENTS } from '../domain/catalogue.seed'
import { ShelfPage } from './pages/ShelfPage'
import { ScentPage } from './pages/ScentPage'

const catalogue = createCatalogue(SEED_SCENTS)
const wardrobe = createWardrobe()

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ShelfPage catalogue={catalogue} />} />
        <Route path="/scent/:id" element={<ScentPage catalogue={catalogue} wardrobe={wardrobe} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
