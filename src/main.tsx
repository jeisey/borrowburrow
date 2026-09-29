import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/fraunces/full.css'
import '@fontsource/caveat/latin-500.css'
import '@fontsource/caveat/latin-700.css'
import './styles/base.css'
import './ui/house/house.css'
import './ui/overlays/overlays.css'
import './ui/village/village.css'
import './ui/screens/screens.css'
import { ArtDefs } from './art/ArtDefs'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ArtDefs />
    <App />
  </StrictMode>,
)
