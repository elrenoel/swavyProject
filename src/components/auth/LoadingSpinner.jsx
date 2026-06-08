const LoadingSpinner = ({ className = "h-4 w-4 border-white" }) => (
  <span
    aria-hidden="true"
    className={`inline-block animate-spin rounded-full border-2 border-t-transparent ${className}`}
  />
);

export default LoadingSpinner;
