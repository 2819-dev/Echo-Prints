const SIZES = {
  sm: { icon: 28, wordmark: "text-base", sub: "text-[9px]" },
  md: { icon: 40, wordmark: "text-xl", sub: "text-[10px]" },
  lg: { icon: 72, wordmark: "text-4xl", sub: "text-sm" },
  xl: { icon: 108, wordmark: "text-6xl", sub: "text-base" },
} as const;

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* isometric cube */}
      <path
        d="M32 6 L54 18 L32 30 L10 18 Z"
        fill="#9aa5b1"
        stroke="#0b1220"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M10 18 L32 30 L32 54 L10 42 Z"
        fill="#39414d"
        stroke="#0b1220"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M32 30 L54 18 L54 42 L32 54 Z"
        fill="#2f8ff0"
        stroke="#0b1220"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* echo waves */}
      <path d="M58 23 A9 9 0 0 1 58 41" stroke="#2f8ff0" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path
        d="M63.5 15 A18 18 0 0 1 63.5 49"
        stroke="#2f8ff0"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}

export default function Logo({ size = "md" }: { size?: keyof typeof SIZES }) {
  const cfg = SIZES[size];
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={cfg.icon} />
      <span className="flex flex-col leading-none">
        <span className={`font-extrabold tracking-tight text-white ${cfg.wordmark}`}>ECHO</span>
        <span className={`font-semibold tracking-[0.3em] text-slate-400 ${cfg.sub}`}>PRINTS</span>
      </span>
    </span>
  );
}
