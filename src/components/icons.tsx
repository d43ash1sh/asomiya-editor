
import { Code, FileText } from 'lucide-react';

/** The asomiya.codes logo: অ on the gold key, আ ক খ on the others. Colours follow the site tokens. */
export function AsomiyaLogo({ size = 30 }: { size?: number }) {
  const key = (x: number, y: number, letter: string, main: boolean) => (
    <g key={letter}>
      <rect
        x={x}
        y={y}
        width={19}
        height={19}
        rx={4.5}
        fill={main ? 'var(--logo)' : 'var(--mist-2)'}
        stroke={main ? 'none' : 'var(--line-2)'}
        strokeWidth={0.8}
      />
      <text
        x={x + 9.5}
        y={y + 14}
        textAnchor="middle"
        textLength={letter === 'আ' ? 13.5 : 11}
        lengthAdjust="spacingAndGlyphs"
        fill={main ? 'var(--logo-ink, #292524)' : 'var(--ink)'}
        style={{ font: '700 12.5px var(--font-assamese)' }}
      >
        {letter}
      </text>
    </g>
  );
  return (
    <svg viewBox="0 0 42 42" width={size} height={size} aria-hidden="true" focusable="false">
      {key(1, 1, 'অ', true)}
      {key(22, 1, 'আ', false)}
      {key(1, 22, 'ক', false)}
      {key(22, 22, 'খ', false)}
    </svg>
  );
}

/** File icon for .asom files: অ on the gold key, matching the asomiya.codes brand. */
export function AsomFileIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ flex: 'none', display: 'block' }}
    >
      <rect x="1" y="1" width="22" height="22" rx="5.5" fill="#F2C14E" />
      <text
        x="12"
        y="17.2"
        textAnchor="middle"
        fill="#121110"
        style={{ font: '700 15px var(--font-assamese)' }}
      >
        অ
      </text>
    </svg>
  );
}

/** One place that decides the icon for a file name, so the explorer, tabs and search agree. */
export function FileTypeIcon({ name, size = 16 }: { name: string; size?: number }) {
  if (name.endsWith('.asom') || name.endsWith('.asomiya')) return <AsomFileIcon size={size} />;
  if (name.endsWith('.py')) return <Code size={size} color="var(--accent)" style={{ flex: 'none' }} />;
  return <FileText size={size} color="var(--vscode-text-muted)" style={{ flex: 'none' }} />;
}

