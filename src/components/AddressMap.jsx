import { useEffect, useId, useRef, useState } from 'react'
import { env } from '../config/env'

function AddressMap({ address, onLocationChange, editable = false, onAddressChange }) {
  const [displayAddress, setDisplayAddress] = useState(address || '')
  const [coordinates, setCoordinates] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceTimer = useRef(null)
  const requestRef = useRef(null)
  const wrapperRef = useRef(null)
  const inputId = useId()
  const listId = `${inputId}-list`

  // Geocodificar dirección a coordenadas usando Nominatim (API gratuita)
  const geocodeAddress = async addressText => {
    if (!addressText || addressText.trim().length === 0) {
      setError('')
      setCoordinates(null)
      setSuggestions([])
      return
    }

    // Cancela la búsqueda anterior para evitar respuestas fuera de orden
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller

    setLoading(true)
    setError('')
    setSuggestions([])

    try {
      const searchQuery = `${addressText}, Bogotá, Colombia`
      const response = await fetch(
        `${env.geocodingApi}?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`,
        {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        }
      )

      if (!response.ok) throw new Error('Error en geocoding')

      const data = await response.json()

      const bogotaResults = data.filter(
        item =>
          item.display_name.toLowerCase().includes('bogotá') ||
          item.display_name.toLowerCase().includes('bogota')
      )

      if (bogotaResults.length === 0) {
        setError('Dirección no encontrada en Bogotá. Intenta con otra.')
        setCoordinates(null)
        setSuggestions([])
        return
      }

      if (editable && bogotaResults.length > 1) {
        setSuggestions(bogotaResults)
        setShowSuggestions(true)
        setActiveIndex(-1)
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
      if (err.name === 'AbortError') return
      setError('No pudimos buscar la dirección. Revisa tu conexión e intenta de nuevo.')
      setCoordinates(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!editable && address) {
      geocodeAddress(address)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, editable])

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      requestRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    const onPointerDown = event => {
      if (!wrapperRef.current?.contains(event.target)) {
        setShowSuggestions(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const handleAddressInput = event => {
    const value = event.target.value
    setDisplayAddress(value)
    onAddressChange?.(value)

    if (debounceTimer.current) clearTimeout(debounceTimer.current)

    if (value.length > 3) {
      debounceTimer.current = setTimeout(() => {
        geocodeAddress(value)
      }, 500)
    } else {
      setCoordinates(null)
      setSuggestions([])
      setShowSuggestions(false)
      setError('')
    }
  }

  const handleSelectSuggestion = suggestion => {
    const { lat, lon, display_name } = suggestion
    const coords = { lat: parseFloat(lat), lng: parseFloat(lon), name: display_name }

    setCoordinates(coords)
    setDisplayAddress(display_name)
    setSuggestions([])
    setShowSuggestions(false)
    setActiveIndex(-1)
    setError('')
    onLocationChange?.(coords)
    onAddressChange?.(display_name)
  }

  const handleKeyDown = event => {
    if (!showSuggestions || suggestions.length === 0) {
      if (event.key === 'Escape') setShowSuggestions(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex(prev => (prev + 1) % suggestions.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault()
      handleSelectSuggestion(suggestions[activeIndex])
    } else if (event.key === 'Escape') {
      setShowSuggestions(false)
      setActiveIndex(-1)
    }
  }

  const mapUrl = coordinates
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.015},${coordinates.lat - 0.015},${coordinates.lng + 0.015},${coordinates.lat + 0.015}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`
    : null

  return (
    <div className="address-map-container">
      {editable && (
        <div className="address-input-wrapper" ref={wrapperRef}>
          <div className="address-input-field">
            <i className="fa-solid fa-location-dot" aria-hidden="true" />
            <label className="sr-only" htmlFor={inputId}>
              Dirección del servicio en Bogotá
            </label>
            <input
              id={inputId}
              type="text"
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
              }
              placeholder="Busca tu dirección en Bogotá (ej: Calle 85 # 11-53)"
              value={displayAddress}
              onChange={handleAddressInput}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="address-search-input"
              autoComplete="off"
            />
            {loading && (
              <i className="fa-solid fa-spinner fa-spin loading-icon" aria-hidden="true" />
            )}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-list" role="listbox" id={listId}>
              {suggestions.map((suggestion, idx) => (
                <button
                  key={`${suggestion.lat}-${suggestion.lon}`}
                  id={`${listId}-option-${idx}`}
                  role="option"
                  aria-selected={activeIndex === idx}
                  className="suggestion-item"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  type="button"
                >
                  <i className="fa-solid fa-map-pin" aria-hidden="true" />
                  <span>{suggestion.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="map-error" role="alert">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" /> {error}
        </div>
      )}

      {loading && !editable && (
        <div className="map-loading" role="status">
          <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
          <span>Localizando dirección…</span>
        </div>
      )}

      {!loading && coordinates && (
        <div className="map-wrapper">
          <iframe
            width="100%"
            height="350"
            src={mapUrl}
            style={{ border: '1px solid var(--line)', borderRadius: '16px' }}
            title="Mapa de la ubicación del servicio"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="map-info">
            <p>
              <strong>Ubicación confirmada</strong>
            </p>
            <p className="map-address">{coordinates.name}</p>
            <p className="map-coords">
              <i className="fa-solid fa-compass" aria-hidden="true" />
              Lat: {coordinates.lat.toFixed(6)} · Lng: {coordinates.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {!loading && !coordinates && displayAddress && !editable && (
        <div className="map-placeholder">
          <i className="fa-solid fa-map" aria-hidden="true" />
          <p>Buscando ubicación…</p>
        </div>
      )}

      {!loading && !coordinates && !displayAddress && editable && (
        <div className="map-placeholder">
          <i className="fa-solid fa-map-location-dot" aria-hidden="true" />
          <p>Escribe tu dirección para ver el mapa</p>
        </div>
      )}
    </div>
  )
}

export default AddressMap
