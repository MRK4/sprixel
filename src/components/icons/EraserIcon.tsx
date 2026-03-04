export function EraserIcon({ width, height, className }: { width: number; height: number; className?: string }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M7 3H13V5H7V3Z" fill="currentColor" />
      <path d="M5 5H7V7H5V5Z" fill="currentColor" />
      <path d="M3 7H5V13H3V7Z" fill="currentColor" />
      <path d="M15 5H13V7H11V9H9V11H7V13H5V15H7V17H9V19H11V21H13H15H17V19H19V17H21V15V13V11H19V9H17V7H15V5Z" fill="currentColor" />
    </svg>
  )
}
