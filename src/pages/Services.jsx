import { useState } from 'react'
import FloatingNav from '../components/FloatingNav'
import Header from '../components/Header'
import { servicesDatabase } from '../js/services'
import '../styles/services.css'

function Services({ onNavSelect }) {
  const [activeCategory, setActiveCategory] = useState('plomeria')
  const [activeOptionIndex, setActiveOptionIndex] = useState(0)
  const [fadeClass, setFadeClass] = useState('')

  const categoryData = servicesDatabase[activeCategory]
  const currentOption = categoryData.options[activeOptionIndex]

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId)
    setActiveOptionIndex(0)
  }

  const handleOptionChange = (index) => {
    setFadeClass('fade-out')
    setTimeout(() => {
      setActiveOptionIndex(index)
      setFadeClass('fade-in')
    }, 200)
  }

  return (
    <div className="page-wrapper view-transition">
      <FloatingNav activeLabel="Servicios" onSelect={onNavSelect} theme="light" />
      <Header variant="light" showAuthButtons={true} />
      <div className="page-content">
        <div className="services-page">
        <main className="services-main">
          {/* --- PANEL IZQUIERDO --- */}
          <div className="left-panel">
            <div className="bg-circle"></div>

            <div className="presentation-data">
              <h1 className="service-title">{currentOption.title}</h1>
              <p className="service-subtitle">{currentOption.subtitle}</p>

              <div className="info-label">Evaluación IA Inicial:</div>
              <div className="info-boxes">
                <div className="info-box">
                  <h4>{currentOption.time}</h4>
                  <p>Tiempo Est.</p>
                </div>
                <div className="info-box">
                  <h4>{currentOption.warranty}</h4>
                  <p>Garantía</p>
                </div>
                <div className="info-box">
                  <h4>{currentOption.techs}</h4>
                  <p>Técnicos</p>
                </div>
              </div>
            </div>

            <div className="main-image-container">
              <img
                src={currentOption.image}
                alt={currentOption.title}
                className={fadeClass}
              />
            </div>

            <div className="bottom-action">
              <div className="price-display">
                <p>Cotización Base</p>
                <h2>{currentOption.basePrice}</h2>
              </div>
              <button className="btn-cta">
                Continuar <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>

          {/* --- PANEL DERECHO --- */}
          <div className="right-panel">
            <h3>Detalles del problema</h3>

            {/* Categorías principales */}
            <div className="config-section">
              <p className="section-title">Categoría de servicio:</p>
              <div className="category-grid">
                {Object.entries(servicesDatabase).map(([key, category]) => (
                  <button
                    key={key}
                    className={`category-btn ${activeCategory === key ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(key)}
                  >
                    <i className={`fa-solid ${category.icon}`}></i>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-opciones de la categoría */}
            <div className="config-section">
              <p className="section-title">Selecciona el requerimiento:</p>
              <div className="options-grid">
                {categoryData.options.map((option, index) => (
                  <div
                    key={index}
                    className={`option-pill ${index === activeOptionIndex ? 'active' : ''}`}
                    onClick={() => handleOptionChange(index)}
                  >
                    <div className="check-mark">
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <div className="icon-circle">
                      <i className={`fa-solid ${option.icon}`}></i>
                    </div>
                    <p className="base-price">{option.priceLabel}</p>
                    <p className="opt-name">{option.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        </div>
      </div>
    </div>
  )
}

export default Services
