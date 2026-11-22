import type { languages } from 'monaco-editor';
import { describe } from './service';

/**
 * Hover provider matching the official VS Code extension (editors/vscode/src/extension.ts).
 * Displays word documentation, signatures, bilingual meanings, and Python equivalents.
 */
export function createHoverProvider(): languages.HoverProvider {
  return {
    provideHover(model, position) {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const markdown = describe(word.word);
      if (!markdown) return null;

      return {
        range: {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        },
        contents: [{ value: markdown }],
      };
    },
  };
}
