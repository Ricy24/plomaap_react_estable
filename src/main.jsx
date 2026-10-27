import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/theme-global.css'
import './index.css'
import App from './App.jsx'
import { validateEnv } from './config/env.js'

validateEnv()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
