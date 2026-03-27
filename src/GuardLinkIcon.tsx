const GuardLinkIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="-2 -2 44 44" fill="none" className={`block flex-shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(20, 20) rotate(45)">
      <rect x="-16" y="-16" width="32" height="32" rx="4" ry="4"
        fill="none" stroke="currentColor" strokeWidth="2.5" />
    </g>
    <g transform="translate(20, 20)">
      <path d="M0 -9 L8 0 L5.5 0 L0 -6 L-5.5 0 L-8 0 Z" fill="currentColor" />
      <path d="M0 -1 L8 8 L5.5 8 L0 2 L-5.5 8 L-8 8 Z" fill="currentColor" opacity="0.5" />
    </g>
  </svg>
);

export default GuardLinkIcon;
