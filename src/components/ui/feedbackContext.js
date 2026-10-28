import { createContext, useContext } from 'react'

export const FeedbackContext = createContext(null)

/**
 * Acceso a toasts y al diálogo de confirmación accesible.
 * Debe usarse dentro de <FeedbackProvider>.
 */
export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (!context) {
    throw new Error('useFeedback debe usarse dentro de FeedbackProvider')
  }
  return context
}
