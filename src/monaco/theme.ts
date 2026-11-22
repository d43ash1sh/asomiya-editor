import type { editor } from 'monaco-editor';

/**
 * Exact color palette from the official Asomiya website (website/styles.css)
 * Both dark and light themes match asomiya.codes down to exact token colors.
 */

export const ASOMIYA_DARK_THEME: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: 'a5a6ff', fontStyle: 'bold' }, // --tok-kw
    { token: 'support.function', foreground: 'c4b5fd' }, // --tok-fn
    { token: 'constant.language', foreground: 'f472b6' }, // --tok-lit
    { token: 'identifier', foreground: 'f5f5f4' }, // --code-ink / --ink
    { token: 'number', foreground: 'fdba74' }, // --tok-num
    { token: 'string', foreground: 'a3e635' }, // --tok-str
    { token: 'string.escape', foreground: 'fb923c' }, // --gold
    { token: 'comment', foreground: '78716c', fontStyle: 'italic' }, // --tok-com
    { token: 'operator', foreground: 'd6d3d1' }, // --tok-op
    { token: 'delimiter', foreground: 'd6d3d1' },
  ],
  colors: {
    'editor.background': '#1c1917', // --code-bg / --surface
    'editor.foreground': '#f5f5f4', // --code-ink / --ink
    'editorLineNumber.foreground': '#78716c', // --ink-4
    'editorLineNumber.activeForeground': '#f5f5f4', // --ink
    'editorCursor.foreground': '#7072ff', // --accent
    'editor.selectionBackground': '#7072ff3d', // --accent-soft
    'editor.inactiveSelectionBackground': '#262220', // --mist-2
    'editor.lineHighlightBackground': '#ffffff08',
    'editorIndentGuide.background': '#2e2a27', // --line
    'editorIndentGuide.activeBackground': '#3d3835', // --line-2
  },
};

export const ASOMIYA_LIGHT_THEME: editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '3f40fa', fontStyle: 'bold' }, // --tok-kw
    { token: 'support.function', foreground: '7c3aed' }, // --tok-fn
    { token: 'constant.language', foreground: 'e11d74' }, // --tok-lit
    { token: 'identifier', foreground: '292524' }, // --code-ink / --ink
    { token: 'number', foreground: 'c2410c' }, // --tok-num
    { token: 'string', foreground: '4d7c0f' }, // --tok-str
    { token: 'string.escape', foreground: 'c2410c' }, // --gold
    { token: 'comment', foreground: 'a8a29e', fontStyle: 'italic' }, // --tok-com
    { token: 'operator', foreground: '57534e' }, // --tok-op
    { token: 'delimiter', foreground: '57534e' },
  ],
  colors: {
    'editor.background': '#fafaf9', // --code-bg / --cotton
    'editor.foreground': '#292524', // --code-ink / --ink
    'editorLineNumber.foreground': '#a8a29e', // --ink-4
    'editorLineNumber.activeForeground': '#292524', // --ink
    'editorCursor.foreground': '#3f40fa', // --accent
    'editor.selectionBackground': '#ecedff', // --accent-soft
    'editor.inactiveSelectionBackground': '#f0efee', // --mist-2
    'editor.lineHighlightBackground': '#00000008',
    'editorIndentGuide.background': '#e7e5e4', // --line
    'editorIndentGuide.activeBackground': '#dad7d4', // --line-2
  },
};
