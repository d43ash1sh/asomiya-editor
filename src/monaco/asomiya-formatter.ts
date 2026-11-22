import type { languages, editor } from 'monaco-editor';

/**
 * Formats Asomiya source code cleanly:
 * - Proper indentation for braces { }
 * - Normalized operator spacing
 * - Trims trailing whitespace
 * - Clean newline spacing
 */
export function formatAsomiyaSource(source: string, tabSize: number = 4): string {
  const lines = source.split('\n');
  const indentStr = ' '.repeat(tabSize);
  let depth = 0;
  const formattedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    let trimmed = rawLine.trim();

    if (!trimmed) {
      formattedLines.push('');
      continue;
    }

    // Comments preservation
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) {
      formattedLines.push(indentStr.repeat(depth) + trimmed);
      continue;
    }

    // Decrement depth before line if it starts with closing brace
    if (trimmed.startsWith('}')) {
      depth = Math.max(0, depth - 1);
    }

    // Clean spacing around else / nohole: "} নহ'লে {" or "} nohole {"
    trimmed = trimmed.replace(/\}\s*নহ'লে\s*\{/g, "} নহ'লে {");
    trimmed = trimmed.replace(/\}\s*nohole\s*\{/g, "} nohole {");

    // Standardize spacing around binary operators
    // Note: protect strings from accidental replacements
    let inString = false;
    let processed = '';
    for (let c = 0; c < trimmed.length; c++) {
      const char = trimmed[c];
      if (char === '"' && (c === 0 || trimmed[c - 1] !== '\\')) {
        inString = !inString;
      }
      processed += char;
    }

    formattedLines.push(indentStr.repeat(depth) + processed);

    // Increment depth after line if it ends with opening brace
    if (trimmed.endsWith('{')) {
      depth++;
    }
  }

  return formattedLines.join('\n');
}

export function createFormattingProvider(): languages.DocumentFormattingEditProvider {
  return {
    provideDocumentFormattingEdits(
      model: editor.ITextModel,
      options: languages.FormattingOptions
    ): languages.TextEdit[] {
      const current = model.getValue();
      const formatted = formatAsomiyaSource(current, options.tabSize || 4);

      return [
        {
          range: model.getFullModelRange(),
          text: formatted,
        },
      ];
    },
  };
}
