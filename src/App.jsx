import { useState } from 'react'
import Home from './pages/Home.jsx'
import Services from './pages/Services.jsx'

import './styles/theme-global.css'

function App() {
  const [currentPage, setCurrentPage] = useState('Inicio')

  const renderPage = () => {
    switch (currentPage) {
      case 'Servicios':
        return <Services onNavSelect={setCurrentPage} />

      default:
        return <Home onNavSelect={setCurrentPage} />
    }
  }

  return renderPage()
}

export default App
