import { C, F } from '@/lib/theme';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  inverted?: boolean;
  responsiveText?: boolean;
};

export function Logo({
  size = 'md',
  showText = true,
  inverted = false,
  responsiveText = false,
}: LogoProps) {
  const heights = { sm: 32, md: 44, lg: 64 };
  const logoHeight = heights[size];
  const textColor = inverted ? '#FFFFFF' : C.ink;
  const accentColor = inverted ? '#E8D9B0' : C.accent;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <img
        src="/logo-jm.png"
        alt="JM Ingeniería & Arquitectura"
        style={{
          height: logoHeight,
          width: 'auto',
          display: 'block',
          filter: inverted ? 'invert(1)' : 'none',
        }}
      />
      {showText && (
        <div
          className={responsiveText ? 'logo-text-responsive' : ''}
          style={{
            display: 'flex', alignItems: 'center',
            borderLeft: `1px solid ${accentColor}`, paddingLeft: 14,
            height: logoHeight * 0.72,
          }}
        >
          <span style={{
            fontFamily: F.brand,
            fontSize: size === 'sm' ? 11 : size === 'md' ? 13 : 16,
            fontWeight: 500,
            color: textColor,
            letterSpacing: '0.18em',
            lineHeight: 1,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            JM Ingeniería
            <span style={{ color: accentColor, margin: '0 4px' }}>·</span>
            Arquitectura
          </span>
        </div>
      )}
    </div>
  );
}
