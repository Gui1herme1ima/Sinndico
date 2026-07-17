import { cn } from '@/lib/cn';

export interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

// Reimplementa brand-assets/assets/brand/symbol.svg como componente — usa classes Tailwind em vez
// de hex fixo, pra reagir ao tema automaticamente (o brand kit tem um SVG por tema; aqui é um só).
export function Logo({ size = 32, withWordmark = true, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
        <rect x="2" y="2" width="96" height="96" rx="28" className="fill-primary" />
        <text
          x="49"
          y="55"
          fontFamily="Space Grotesk, sans-serif"
          fontWeight="700"
          fontSize="60"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-primary-contrast"
        >
          S
        </text>
        <circle cx="77" cy="24" r="9" className="fill-accent" />
      </svg>
      {withWordmark && <span className="font-display text-xl font-bold text-primary">Sinndico</span>}
    </div>
  );
}
