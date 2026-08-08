export function PathMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M12 4v6.5M12 10.5c0 3.8-5.5 4.2-5.5 9.5M12 10.5c0 3.8 5.5 4.2 5.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="3.6" r="1.85" fill="var(--accent)" stroke="none" />
    </svg>
  );
}
