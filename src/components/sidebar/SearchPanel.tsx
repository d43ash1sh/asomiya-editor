import React, { useState } from 'react';
import { Search as SearchIcon, FileCode } from 'lucide-react';
import type { VFSProject } from '../../vfs/types';

interface SearchPanelProps {
  project: VFSProject;
  openFile: (fileId: string) => void;
}

interface MatchResult {
  fileId: string;
  fileName: string;
  lineNumber: number;
  lineText: string;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ project, openFile }) => {
  const [query, setQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);

  const results: MatchResult[] = [];
  if (query.trim()) {
    const q = caseSensitive ? query : query.toLowerCase();
    for (const file of Object.values(project.files)) {
      if (typeof file.content === 'string') {
        const lines = file.content.split('\n');
        lines.forEach((line, idx) => {
          const testLine = caseSensitive ? line : line.toLowerCase();
          if (testLine.includes(q)) {
            results.push({
              fileId: file.id,
              fileName: file.name,
              lineNumber: idx + 1,
              lineText: line.trim(),
            });
          }
        });
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '8px 12px' }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: 'var(--vscode-text-muted)',
          marginBottom: 8,
        }}
      >
        SEARCH WORKSPACE
      </div>

      <div style={{ position: 'relative', marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Search text in project..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '5px 8px 5px 26px',
            fontSize: 12,
            borderRadius: 2,
          }}
        />
        <SearchIcon
          size={14}
          style={{ position: 'absolute', left: 7, top: 7, color: 'var(--vscode-text-muted)' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 11 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
          />
          Match Case
        </label>
        <span style={{ marginLeft: 'auto', color: 'var(--vscode-text-muted)' }}>
          {query.trim() ? `${results.length} results` : ''}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {results.map((res, i) => (
          <div
            key={i}
            onClick={() => openFile(res.fileId)}
            style={{
              padding: '6px 8px',
              backgroundColor: 'var(--vscode-hover)',
              borderRadius: 3,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#007acc', fontWeight: 600 }}>
              <FileCode size={13} />
              <span>{res.fileName}:{res.lineNumber}</span>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--vscode-text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: 2,
              }}
            >
              {res.lineText}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
