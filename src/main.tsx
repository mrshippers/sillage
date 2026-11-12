import '@fontsource-variable/bodoni-moda/opsz.css'
import '@fontsource-variable/bodoni-moda/opsz-italic.css'
import '@fontsource-variable/jost'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './ui/tokens.css'
import SillageApp from './sillage/SillageApp'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SillageApp />
  </React.StrictMode>,
)
