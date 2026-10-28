import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { FeedbackContext } from './feedbackContext'

let toastId = 0

/**
 * Provee toasts y diálogos de confirmación accesibles.
 * Sustituye window.alert / window.confirm en toda la app.
 */
export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [dialog, setDialog] = useState(null)
  const resolverRef = useRef(null)
  const confirmBtnRef = useRef(null)
  const cancelBtnRef = useRef(null)
  const restoreFocusRef = useRef(null)
  const timersRef = useRef(new Map())

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach(timer => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const dismissToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const pushToast = useCallback(
    (message, options = {}) => {
      const id = ++toastId
      const { tone = 'info', title, duration = 4800 } = options
      setToasts(prev => [...prev.slice(-3), { id, message, tone, title }])

      if (duration > 0) {
        const timer = setTimeout(() => dismissToast(id), duration)
        timersRef.current.set(id, timer)
      }

      return id
    },
    [dismissToast]
  )

  const toast = useMemo(
    () => ({
      success: (message, options) =>
        pushToast(message, { ...options, tone: 'success' }),
      error: (message, options) =>
        pushToast(message, { ...options, tone: 'error', duration: 7000 }),
      info: (message, options) => pushToast(message, { ...options, tone: 'info' }),
      dismiss: dismissToast,
    }),
    [pushToast, dismissToast]
  )

  const confirm = useCallback(options => {
    restoreFocusRef.current =
      typeof document !== 'undefined' ? document.activeElement : null
    return new Promise(resolve => {
      resolverRef.current = resolve
      setDialog({
        title: '¿Confirmar acción?',
        description: '',
        confirmLabel: 'Confirmar',
        cancelLabel: 'Cancelar',
        tone: 'default',
        ...options,
      })
    })
  }, [])

  const closeDialog = useCallback(result => {
    setDialog(null)
    resolverRef.current?.(result)
    resolverRef.current = null
    if (restoreFocusRef.current?.focus) {
      restoreFocusRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (!dialog) return

    const initialFocus =
      dialog.tone === 'danger' ? cancelBtnRef.current : confirmBtnRef.current
    if (initialFocus) {
      initialFocus.focus()
      // Si el navegador aún no montó el foco (p. ej. pestaña sin foco), reintenta.
      if (document.activeElement !== initialFocus) {
        requestAnimationFrame(() => initialFocus.focus())
      }
    }

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeDialog(false)
      }
      if (event.key === 'Tab') {
        const focusables = document
          .querySelectorAll('.dialog button')
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [dialog, closeDialog])

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm])

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.tone}`} role="status">
            <span className="toast__icon" aria-hidden="true">
              <i
                className={`fa-solid ${
                  t.tone === 'success'
                    ? 'fa-check'
                    : t.tone === 'error'
                      ? 'fa-exclamation'
                      : 'fa-circle-info'
                }`}
              />
            </span>
            <div className="toast__body">
              {t.title && <p className="toast__title">{t.title}</p>}
              <p className="toast__message">{t.message}</p>
            </div>
            <button
              type="button"
              className="toast__close"
              onClick={() => dismissToast(t.id)}
              aria-label="Cerrar notificación"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        ))}
      </div>

      {dialog && (
        <div
          className="dialog-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) closeDialog(false)
          }}
        >
          <div
            className="dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby={dialog.description ? 'dialog-desc' : undefined}
          >
            <div
              className={`dialog__icon ${
                dialog.tone === 'danger' ? 'dialog__icon--danger' : ''
              }`}
              aria-hidden="true"
            >
              <i
                className={`fa-solid ${
                  dialog.tone === 'danger'
                    ? 'fa-triangle-exclamation'
                    : 'fa-circle-question'
                }`}
              />
            </div>
            <h3 id="dialog-title">{dialog.title}</h3>
            {dialog.description && <p id="dialog-desc">{dialog.description}</p>}
            <div className="dialog__actions">
              <button
                type="button"
                ref={cancelBtnRef}
                className="btn btn--ghost"
                onClick={() => closeDialog(false)}
              >
                {dialog.cancelLabel}
              </button>
              <button
                type="button"
                ref={confirmBtnRef}
                className={`btn ${
                  dialog.tone === 'danger' ? 'btn--danger' : ''
                }`}
                onClick={() => closeDialog(true)}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  )
}
