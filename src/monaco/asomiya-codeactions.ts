import type { languages, editor, IRange } from 'monaco-editor';
import { KEYWORD_GLOSSARY, BUILTIN_NAMES, BUILTIN_ROMAN } from 'asomiya';

export function createCodeActionProvider(): languages.CodeActionProvider {
  return {
    provideCodeActions(
      model: editor.ITextModel,
      range: IRange,
      context: languages.CodeActionContext
    ): languages.CodeActionList {
      const actions: languages.CodeAction[] = [];

      // 1. Quick Fix for Diagnostics
      for (const marker of context.markers) {
        const msg = marker.message;

        // Check for suggestions in error message like "did you mean '...'" or "আপুনি '...' বুজাব খুজিছে নেকি"
        const matchEn = msg.match(/did you mean ['"]([^'"]+)['"]/i);
        const matchAs = msg.match(/['"]([^'"]+)['"]\s*বুজাব খুজিছে নেকি/);
        const suggestion = matchEn?.[1] || matchAs?.[1];

        if (suggestion) {
          actions.push({
            title: `Fix to: "${suggestion}"`,
            diagnostics: [marker],
            kind: 'quickfix',
            isPreferred: true,
            edit: {
              edits: [
                {
                  resource: model.uri,
                  textEdit: {
                    range: {
                      startLineNumber: marker.startLineNumber,
                      startColumn: marker.startColumn,
                      endLineNumber: marker.endLineNumber,
                      endColumn: marker.endColumn,
                    },
                    text: suggestion,
                  },
                  versionId: model.getVersionId(),
                },
              ],
            },
          });
        }
      }

      // 2. Refactor Action: Convert Selected Keyword between Assamese & Roman
      const selectedWord = model.getValueInRange(range).trim();
      if (selectedWord) {
        // Check if selected word is Roman keyword -> offer convert to Assamese
        for (const entry of KEYWORD_GLOSSARY) {
          if (entry.roman.includes(selectedWord)) {
            actions.push({
              title: `Convert "${selectedWord}" to Assamese script ("${entry.word}")`,
              kind: 'refactor.rewrite',
              edit: {
                edits: [
                  {
                    resource: model.uri,
                    textEdit: {
                      range,
                      text: entry.word,
                    },
                    versionId: model.getVersionId(),
                  },
                ],
              },
            });
          } else if (entry.word === selectedWord) {
            const roman = entry.roman[0];
            if (roman) {
              actions.push({
                title: `Convert "${selectedWord}" to Roman script ("${roman}")`,
                kind: 'refactor.rewrite',
                edit: {
                  edits: [
                    {
                      resource: model.uri,
                      textEdit: {
                        range,
                        text: roman,
                      },
                      versionId: model.getVersionId(),
                    },
                  ],
                },
              });
            }
          }
        }

        // Check if selected word is built-in
        for (const [key, asWord] of Object.entries(BUILTIN_NAMES)) {
          const romanList = BUILTIN_ROMAN[key as keyof typeof BUILTIN_ROMAN] || [];
          if (romanList.includes(selectedWord)) {
            actions.push({
              title: `Convert "${selectedWord}" to Assamese ("${asWord}")`,
              kind: 'refactor.rewrite',
              edit: {
                edits: [
                  {
                    resource: model.uri,
                    textEdit: {
                      range,
                      text: asWord,
                    },
                    versionId: model.getVersionId(),
                  },
                ],
              },
            });
          } else if (asWord === selectedWord && romanList[0]) {
            actions.push({
              title: `Convert "${selectedWord}" to Roman ("${romanList[0]}")`,
              kind: 'refactor.rewrite',
              edit: {
                edits: [
                  {
                    resource: model.uri,
                    textEdit: {
                      range,
                      text: romanList[0],
                    },
                    versionId: model.getVersionId(),
                  },
                ],
              },
            });
          }
        }
      }

      return {
        actions,
        dispose() {},
      };
    },
  };
}
