import React from 'react';
import type { EditorSettings } from '../../types';

interface SettingsPanelProps {
  settings: EditorSettings;
  setSettings: React.Dispatch<React.SetStateAction<EditorSettings>>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '8px 12px' }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: 'var(--vscode-text-muted)',
          marginBottom: 12,
        }}
      >
        EDITOR & RUNTIME SETTINGS
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Digits Style */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
            Number Digits Style (সংখ্যাৰ অংক)
          </label>
          <select
            value={settings.digits}
            onChange={(e) =>
              setSettings((s) => ({ ...s, digits: e.target.value as 'assamese' | 'ascii' }))
            }
            style={{ width: '100%', padding: '4px 8px', borderRadius: 2 }}
          >
            <option value="assamese">অসমীয়া অংক (০, ১, ২, ৩, ৪...)</option>
            <option value="ascii">ASCII Digits (0, 1, 2, 3, 4...)</option>
          </select>
          <div style={{ fontSize: 11, color: 'var(--vscode-text-muted)', marginTop: 2 }}>
            Determines how printed numbers are rendered in the console.
          </div>
        </div>

        {/* Error Messages Language */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
            Diagnostics Language (ত্ৰুটিৰ ভাষা)
          </label>
          <select
            value={settings.lang}
            onChange={(e) =>
              setSettings((s) => ({ ...s, lang: e.target.value as 'as' | 'en' }))
            }
            style={{ width: '100%', padding: '4px 8px', borderRadius: 2 }}
          >
            <option value="as">অসমীয়া (Assamese)</option>
            <option value="en">English</option>
          </select>
          <div style={{ fontSize: 11, color: 'var(--vscode-text-muted)', marginTop: 2 }}>
            Language for compiler error messages and linter squiggles.
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
            Editor Font Size: {settings.fontSize}px
          </label>
          <input
            type="range"
            min={11}
            max={24}
            value={settings.fontSize}
            onChange={(e) =>
              setSettings((s) => ({ ...s, fontSize: Number(e.target.value) }))
            }
            style={{ width: '100%' }}
          />
        </div>

        {/* Tab Size */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
            Tab Indentation Size
          </label>
          <select
            value={settings.tabSize}
            onChange={(e) =>
              setSettings((s) => ({ ...s, tabSize: Number(e.target.value) }))
            }
            style={{ width: '100%', padding: '4px 8px', borderRadius: 2 }}
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </div>

        {/* Step Budget */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
            Step Budget (Loop/Execution Limit)
          </label>
          <input
            type="number"
            value={settings.maxSteps}
            onChange={(e) =>
              setSettings((s) => ({ ...s, maxSteps: Number(e.target.value) || 1000000 }))
            }
            style={{ width: '100%', padding: '4px 8px', borderRadius: 2 }}
          />
          <div style={{ fontSize: 11, color: 'var(--vscode-text-muted)', marginTop: 2 }}>
            Default: 10,000,000 steps. Prevents infinite loops.
          </div>
        </div>

        {/* Call Depth Limit */}
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
            Call Depth Limit (Recursion Limit)
          </label>
          <input
            type="number"
            value={settings.maxDepth}
            onChange={(e) =>
              setSettings((s) => ({ ...s, maxDepth: Number(e.target.value) || 500 }))
            }
            style={{ width: '100%', padding: '4px 8px', borderRadius: 2 }}
          />
          <div style={{ fontSize: 11, color: 'var(--vscode-text-muted)', marginTop: 2 }}>
            Default: 500 frames. Prevents stack overflow.
          </div>
        </div>
      </div>
    </div>
  );
};
