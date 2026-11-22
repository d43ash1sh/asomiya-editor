import React, { useState } from 'react';
import { BookOpen, Copy, Check } from 'lucide-react';
import { KEYWORD_GLOSSARY, BUILTIN_NAMES, BUILTIN_ROMAN } from 'asomiya';

export const DocsPanel: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '8px 12px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: 'var(--vscode-text-muted)',
          marginBottom: 10,
        }}
      >
        <BookOpen size={14} />
        <span>ASOMIYA LANGUAGE CHEATSHEET</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Keywords Section */}
        <div>
          <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--vscode-text-bright)', marginBottom: 6 }}>
            প্ৰধান শব্দ (Keywords)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {KEYWORD_GLOSSARY.map((k) => (
              <div
                key={k.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 6px',
                  backgroundColor: 'var(--vscode-hover)',
                  borderRadius: 3,
                  fontSize: 12,
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{k.word}</span>
                  <span style={{ color: 'var(--vscode-text-muted)', fontSize: 11, marginLeft: 6 }}>
                    ({k.roman.join(', ')})
                  </span>
                  <div style={{ fontSize: 11, color: 'var(--vscode-text-muted)' }}>
                    {k.meaning}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(k.word, k.id)}
                  title="Copy keyword"
                  style={{ color: 'var(--vscode-text-muted)', padding: 4 }}
                >
                  {copiedKey === k.id ? <Check size={12} color="var(--tea)" /> : <Copy size={12} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Built-in Functions Section */}
        <div>
          <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--vscode-text-bright)', marginBottom: 6 }}>
            অন্তৰ্নিহিত ফাংচন (Built-ins)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Object.entries(BUILTIN_NAMES).map(([key, asWord]) => {
              const romans = BUILTIN_ROMAN[key as keyof typeof BUILTIN_ROMAN] || [];
              return (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '4px 6px',
                    backgroundColor: 'var(--vscode-hover)',
                    borderRadius: 3,
                    fontSize: 12,
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--accent-hover)' }}>{asWord}()</span>
                    <span style={{ color: 'var(--vscode-text-muted)', fontSize: 11, marginLeft: 6 }}>
                      ({romans.join(', ')})
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`${asWord}()`, key)}
                    title="Copy function"
                    style={{ color: 'var(--vscode-text-muted)', padding: 4 }}
                  >
                    {copiedKey === key ? <Check size={12} color="var(--tea)" /> : <Copy size={12} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
