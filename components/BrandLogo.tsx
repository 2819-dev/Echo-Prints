import Image from "next/image";

const ASPECT = 776 / 287;

const SIZES = {
  sm: 24,
  md: 32,
  lg: 52,
  xl: 80,
} as const;

export default function BrandLogo({
  size = "md",
  className = "",
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const height = SIZES[size];
  const width = Math.round(height * ASPECT);

  return (
    <span
      className={`inline-flex items-center rounded-xl bg-white px-3 py-2 shadow-lg shadow-black/30 ${className}`}
    >
      <Image src="/logo.png" alt="Echo Prints" width={width} height={height} priority />
    </span>
  );
}
