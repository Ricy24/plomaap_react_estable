import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/design-system.css'
import './index.css'
import './styles/theme-global.css'
import App from './App.jsx'
import { validateEnv } from './config/env.js'

validateEnv()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
