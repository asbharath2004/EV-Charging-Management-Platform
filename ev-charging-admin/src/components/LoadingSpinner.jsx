const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="loading-state" role="status" aria-live="polite">
    <div className="spinner" aria-hidden="true" />
    <span>{message}</span>
  </div>
)

export default LoadingSpinner
