function EmptyState({ icon = 'fa-inbox', title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        <i className={`fa-solid ${icon}`} />
      </span>
      {title && <h4>{title}</h4>}
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

export default EmptyState
