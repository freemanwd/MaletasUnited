type CrestProps = {
  className?: string;
  title?: string;
};

export function Crest({ className, title = "Maletas United crest" }: CrestProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={title}
      className={className}
    >
      <circle cx="60" cy="60" r="58" fill="#10261c" />
      <circle cx="60" cy="60" r="54" fill="none" stroke="#c9a227" strokeWidth="2.4" />
      <circle cx="60" cy="60" r="49" fill="none" stroke="#e8d48a" strokeWidth="0.8" />
      <path
        d="M60 18c-18 12-27 26-27 42 0 18 12 32 27 42 15-10 27-24 27-42 0-16-9-30-27-42z"
        fill="#1f6b45"
      />
      <circle cx="60" cy="56" r="18" fill="#f4ead8" />
      <path
        d="M48 56c2-8 7-14 12-14s10 6 12 14c-2 8-7 14-12 14s-10-6-12-14z"
        fill="none"
        stroke="#10261c"
        strokeWidth="1.6"
      />
      <path
        d="M42 56h36M60 42v28M49 46c4 4 7 4 11 0M60 56c4 4 7 4 11 0M49 66c4 4 7 4 11 0M60 56c-4 4-7 4-11 0"
        fill="none"
        stroke="#10261c"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <rect x="46" y="72" width="28" height="18" rx="2.5" fill="#9a4d2e" />
      <rect x="46" y="72" width="28" height="18" rx="2.5" fill="none" stroke="#e8d48a" strokeWidth="1.2" />
      <path d="M54 72v-3a6 6 0 0 1 12 0v3" fill="none" stroke="#e8d48a" strokeWidth="1.6" />
      <path d="M46 80h28" stroke="#c9a227" strokeWidth="1" />
      <text
        x="60"
        y="16.5"
        textAnchor="middle"
        fill="#e8d48a"
        fontSize="7.2"
        fontFamily="Georgia, serif"
        letterSpacing="1.6"
      >
        MALETAS
      </text>
      <text
        x="60"
        y="111"
        textAnchor="middle"
        fill="#e8d48a"
        fontSize="6.6"
        fontFamily="Georgia, serif"
        letterSpacing="1.4"
      >
        UNITED
      </text>
    </svg>
  );
}
