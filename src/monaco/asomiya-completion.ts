import type { languages, IRange } from 'monaco-editor';
import { completions, describe } from './service';
import { OFFICIAL_SNIPPETS } from './snippets';

export function createCompletionProvider(monacoLanguages: typeof languages): languages.CompletionItemProvider {
  return {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range: IRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions: languages.CompletionItem[] = [];

      // 1. Official VS Code Extension Snippets
      for (const [title, snip] of Object.entries(OFFICIAL_SNIPPETS)) {
        for (const prefix of snip.prefix) {
          suggestions.push({
            label: `${prefix} — ${title}`,
            kind: monacoLanguages.CompletionItemKind.Snippet,
            insertText: snip.body.join('\n'),
            insertTextRules: monacoLanguages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: snip.description,
            documentation: {
              value: `\`\`\`asomiya\n${snip.body.join('\n')}\n\`\`\`\n\n*${snip.description}*`,
            },
            range,
          });
        }
      }

      // 2. Official VS Code Extension Context-Aware Completions
      const source = model.getValue();
      const items = completions(source);

      for (const c of items) {
        const itemKind =
          c.kind === 'function'
            ? monacoLanguages.CompletionItemKind.Function
            : c.kind === 'constant'
              ? monacoLanguages.CompletionItemKind.Constant
              : monacoLanguages.CompletionItemKind.Keyword;

        const docMarkdown = describe(c.label);

        suggestions.push({
          label: c.label,
          kind: itemKind,
          insertText: c.kind === 'function' && c.word.signature ? `${c.label}(\${1})` : c.label,
          insertTextRules:
            c.kind === 'function' && c.word.signature
              ? monacoLanguages.CompletionItemInsertTextRule.InsertAsSnippet
              : undefined,
          detail: c.detail,
          documentation: docMarkdown ? { value: docMarkdown } : undefined,
          range,
        });
      }

      return { suggestions };
    },
  };
}
