function Logo({ className = '', showText = true, tone = 'brand' }) {
  return (
    <span className={`brand-logo ${className}`.trim()} data-tone={tone}>
      <span className="brand-logo__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 3.5c3.9 4.7 7.8 9.1 7.8 13.6A7.8 7.8 0 0 1 16 25a7.8 7.8 0 0 1-7.8-7.9C8.2 12.6 12.1 8.2 16 3.5Z"
            fill="currentColor"
            opacity="0.16"
          />
          <path
            d="M16 4.8c3.4 4.3 6.6 8.2 6.6 12.3a6.6 6.6 0 1 1-13.2 0c0-4.1 3.2-8 6.6-12.3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M12.7 17.6h6.6M16 14.3v6.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {showText && <span className="brand-logo__text">PlomApp</span>}
    </span>
  )
}

export default Logo
