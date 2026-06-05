import { useState, useEffect, useRef } from 'react'

function AddressMap({ address, onLocationChange, editable = false, onAddressChange }) {
  const [displayAddress, setDisplayAddress] = useState(address || '')
  const [coordinates, setCoordinates] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceTimer = useRef(null)

  // Geocodificar dirección a coordenadas usando Nominatim (API gratuita)
  const geocodeAddress = async (addressText) => {
    if (!addressText || addressText.trim().length === 0) {
      setError('')
      setCoordinates(null)
      setSuggestions([])
      return
    }

    setLoading(true)
    setError('')
    setSuggestions([])
    
    try {
      // Agregar Bogotá a la búsqueda para filtrar por ciudad
      const searchQuery = `${addressText}, Bogotá, Colombia`
      const response = await fetch(
        `${import.meta.env.VITE_GEOCODING_API}?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`,
        {
          headers: {
            'User-Agent': 'plomaap-app'
          }
        }
      )
      
      if (!response.ok) throw new Error('Error en geocoding')
      
      const data = await response.json()
      
      // Filtrar solo resultados de Bogotá
      const bogotaResults = data.filter(item => 
        item.display_name.toLowerCase().includes('bogotá') || 
        item.display_name.toLowerCase().includes('bogota')
      )
      
      if (bogotaResults.length === 0) {
        setError('Dirección no encontrada en Bogotá. Intenta con otra.')
        setCoordinates(null)
        setSuggestions([])
        return
      }

      // Si estamos editando, mostrar sugerencias
      if (editable && bogotaResults.length > 1) {
        setSuggestions(bogotaResults)
        setShowSuggestions(true)
        return
      }

      const { lat, lon, display_name } = bogotaResults[0]
      const coords = { lat: parseFloat(lat), lng: parseFloat(lon), name: display_name }
      
      setCoordinates(coords)
      setDisplayAddress(display_name)
      setSuggestions([])
      setShowSuggestions(false)
      onLocationChange?.(coords)
      onAddressChange?.(display_name)
      
    } catch (err) {
      setError('Error al buscar la dirección: ' + err.message)
      setCoordinates(null)
    } finally {
      setLoading(false)
    }
  }

  // Auto-buscar cuando cambia la dirección (en modo no editable)
  useEffect(() => {
    if (!editable && address) {
      geocodeAddress(address)
    }
  }, [address, editable])

  const handleAddressInput = (e) => {
    const value = e.target.value
    setDisplayAddress(value)
    onAddressChange?.(value)
    
    // Limpiar timer anterior
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Buscar solo si hay más de 3 caracteres con debounce de 500ms
    if (value.length > 3) {
      debounceTimer.current = setTimeout(() => {
        geocodeAddress(value)
      }, 500)
    } else {
      setCoordinates(null)
      setSuggestions([])
      setError('')
    }
  }

  const handleSelectSuggestion = (suggestion) => {
    const { lat, lon, display_name } = suggestion
    const coords = { lat: parseFloat(lat), lng: parseFloat(lon), name: display_name }
    
    setCoordinates(coords)
    setDisplayAddress(display_name)
    setSuggestions([])
    setShowSuggestions(false)
    setError('')
    onLocationChange?.(coords)
    onAddressChange?.(display_name)
  }

  const mapUrl = coordinates 
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.015},${coordinates.lat - 0.015},${coordinates.lng + 0.015},${coordinates.lat + 0.015}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`
    : null

  return (
    <div className="address-map-container">
      {editable && (
        <div className="address-input-wrapper">
          <div className="address-input-field">
            <i className="fa-solid fa-location-dot"></i>
            <input
              type="text"
              placeholder="Busca tu dirección en Bogotá (ej: Calle 85 # 11-53)"
              value={displayAddress}
              onChange={handleAddressInput}
              className="address-search-input"
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            />
            {loading && <i className="fa-solid fa-spinner fa-spin loading-icon"></i>}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-list">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="suggestion-item"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  type="button"
                >
                  <i className="fa-solid fa-map-pin"></i>
                  <span>{suggestion.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && <div className="map-error"><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}
      
      {loading && !editable && (
        <div className="map-loading">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span>Localizando dirección...</span>
        </div>
      )}

      {!loading && coordinates && (
        <div className="map-wrapper">
          <iframe
            width="100%"
            height="350"
            frameBorder="0"
            src={mapUrl}
            style={{ border: '1px solid #ddd', borderRadius: '8px' }}
            title="Mapa de ubicación"
          />
          <div className="map-info">
            <p><strong>📍 Ubicación confirmada:</strong></p>
            <p className="map-address">{coordinates.name}</p>
            <p className="map-coords">
              <i className="fa-solid fa-compass"></i>
              Lat: {coordinates.lat.toFixed(6)} | Lng: {coordinates.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {!loading && !coordinates && displayAddress && !editable && (
        <div className="map-placeholder">
          <i className="fa-solid fa-map"></i>
          <p>Buscando ubicación...</p>
        </div>
      )}

      {!loading && !coordinates && !displayAddress && editable && (
        <div className="map-placeholder">
          <i className="fa-solid fa-search"></i>
          <p>Escribe tu dirección para ver el mapa</p>
        </div>
      )}
    </div>
  )
}

export default AddressMap
