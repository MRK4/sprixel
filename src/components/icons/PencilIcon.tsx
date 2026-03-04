export function PencilIcon({ width, height, className }: { width: number; height: number; className?: string }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M4 8V6V4H6H8V2H6H4H2V4V6V8H4Z" fill="currentColor" />
      <path d="M6 8H4V10H6V12H8V14H10V16H12V18H14V20H16V22H18H20V20H22V18V16H20V14H18V12H16V10H14V8H12V6H10V4H8V6H6V8Z" fill="currentColor" />
    </svg>
  )
}
