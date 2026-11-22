import React, { useEffect, useRef } from 'react';
import Editor, { useMonaco, type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import {
  LANGUAGE_ID,
  languageConfiguration,
  monarchLanguage,
} from '../../monaco/asomiya-language';
import { createCompletionProvider } from '../../monaco/asomiya-completion';
import { createHoverProvider } from '../../monaco/asomiya-hover';
import { validateAsomiyaCode } from '../../monaco/asomiya-diagnostics';
import { createFormattingProvider } from '../../monaco/asomiya-formatter';
import { createCodeActionProvider } from '../../monaco/asomiya-codeactions';
import {
  createDefinitionProvider,
  createDocumentSymbolProvider,
} from '../../monaco/asomiya-definition';
import { ASOMIYA_DARK_THEME, ASOMIYA_LIGHT_THEME } from '../../monaco/theme';
import type { EditorSettings } from '../../types';

interface EditorAreaProps {
  content: string;
  onChange: (value: string) => void;
  fileName: string;
  settings: EditorSettings;
  onRun: () => void;
  setDiagnostics: (markers: editor.IMarkerData[]) => void;
  isMobile?: boolean;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  content,
  onChange,
  fileName,
  settings,
  onRun,
  setDiagnostics,
  isMobile = false,
}) => {
  const monaco = useMonaco();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Register Monaco language and themes once monaco is loaded
  useEffect(() => {
    if (!monaco) return;

    // Check if asomiya is already registered
    const existingLangs = monaco.languages.getLanguages();
    if (!existingLangs.some((l) => l.id === LANGUAGE_ID)) {
      monaco.languages.register({ id: LANGUAGE_ID, extensions: ['.asom', '.asomiya'] });
      monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, monarchLanguage);
      monaco.languages.setLanguageConfiguration(LANGUAGE_ID, languageConfiguration);
      monaco.languages.registerCompletionItemProvider(
        LANGUAGE_ID,
        createCompletionProvider(monaco.languages)
      );
      monaco.languages.registerHoverProvider(LANGUAGE_ID, createHoverProvider());
      monaco.languages.registerDocumentFormattingEditProvider(
        LANGUAGE_ID,
        createFormattingProvider()
      );
      monaco.languages.registerCodeActionProvider(
        LANGUAGE_ID,
        createCodeActionProvider()
      );
      monaco.languages.registerDefinitionProvider(
        LANGUAGE_ID,
        createDefinitionProvider()
      );
      monaco.languages.registerDocumentSymbolProvider(
        LANGUAGE_ID,
        createDocumentSymbolProvider(monaco.languages)
      );
    }

    // Register themes
    monaco.editor.defineTheme('asomiya-dark', ASOMIYA_DARK_THEME);
    monaco.editor.defineTheme('asomiya-light', ASOMIYA_LIGHT_THEME);
    monaco.editor.setTheme(settings.theme === 'dark' ? 'asomiya-dark' : 'asomiya-light');
  }, [monaco, settings.theme]);

  // Real-time diagnostics validation
  useEffect(() => {
    if (!monaco || !editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    if (fileName.endsWith('.asom')) {
      const markers = validateAsomiyaCode(content, settings.lang);
      monaco.editor.setModelMarkers(model, 'asomiya', markers);
      setDiagnostics(markers);
    } else {
      monaco.editor.setModelMarkers(model, 'asomiya', []);
      setDiagnostics([]);
    }
  }, [content, fileName, monaco, settings.lang, setDiagnostics]);

  const handleEditorDidMount: OnMount = (ed, m) => {
    editorRef.current = ed;

    // Add Ctrl+Enter / Cmd+Enter run shortcut
    ed.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.Enter, () => {
      onRun();
    });
  };

  const isAsomiya = fileName.endsWith('.asom');
  const language = isAsomiya
    ? LANGUAGE_ID
    : fileName.endsWith('.py')
    ? 'python'
    : fileName.endsWith('.md')
    ? 'markdown'
    : fileName.endsWith('.json')
    ? 'json'
    : 'plaintext';

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Editor
        height="100%"
        width="100%"
        language={language}
        value={content}
        onChange={(val) => onChange(val || '')}
        theme={settings.theme === 'dark' ? 'asomiya-dark' : 'asomiya-light'}
        onMount={handleEditorDidMount}
        options={{
          fontSize: settings.fontSize,
          lineHeight: Math.round(settings.fontSize * 1.65),
          tabSize: settings.tabSize,
          fontFamily: "'Fira Code', 'Kohinoor Bangla', 'Noto Sans Bengali', Consolas, monospace",
          fontLigatures: true,
          minimap: { enabled: !isMobile, maxColumn: 80 },
          lineNumbersMinChars: isMobile ? 2 : 4,
          folding: !isMobile,
          glyphMargin: false,
          scrollbar: { verticalScrollbarSize: isMobile ? 6 : 12, horizontalScrollbarSize: isMobile ? 6 : 12 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'all',
          automaticLayout: true,
          bracketPairColorization: { enabled: true },
          formatOnPaste: true,
          formatOnType: true,
          wordWrap: 'on',
        }}
      />
    </div>
  );
};
