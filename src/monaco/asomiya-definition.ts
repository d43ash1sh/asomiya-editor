import type { languages, editor, IRange } from 'monaco-editor';

export function createDefinitionProvider(): languages.DefinitionProvider {
  return {
    provideDefinition(model: editor.ITextModel, position) {
      const word = model.getWordAtPosition(position);
      if (!word) return null;

      const target = word.word;
      const text = model.getValue();
      const lines = text.split('\n');

      // Look for function definition: ফাংচন target(...) or fangchon target(...)
      const fnRegex = new RegExp(`(?:ফাংচন|fangchon)\\s+(${target})\\s*\\(`, 'u');
      // Look for variable definition: ধৰা target = or dhora target =
      const varRegex = new RegExp(`(?:ধৰা|dhora)\\s+(${target})\\s*=`, 'u');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const fnMatch = line.match(fnRegex);
        if (fnMatch && fnMatch.index !== undefined) {
          const startCol = fnMatch.index + line.indexOf(target) + 1;
          const range: IRange = {
            startLineNumber: i + 1,
            startColumn: startCol,
            endLineNumber: i + 1,
            endColumn: startCol + target.length,
          };
          return { uri: model.uri, range };
        }

        const varMatch = line.match(varRegex);
        if (varMatch && varMatch.index !== undefined) {
          const startCol = varMatch.index + line.indexOf(target) + 1;
          const range: IRange = {
            startLineNumber: i + 1,
            startColumn: startCol,
            endLineNumber: i + 1,
            endColumn: startCol + target.length,
          };
          return { uri: model.uri, range };
        }
      }

      return null;
    },
  };
}

export function createDocumentSymbolProvider(
  monacoLanguages: typeof languages
): languages.DocumentSymbolProvider {
  return {
    provideDocumentSymbols(model: editor.ITextModel) {
      const symbols: languages.DocumentSymbol[] = [];
      const lines = model.getValue().split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Functions
        const fnMatch = line.match(/(?:ফাংচন|fangchon)\s+([^\s(]+)\s*\(([^)]*)\)/);
        if (fnMatch) {
          const fnName = fnMatch[1];
          const params = fnMatch[2];
          const range: IRange = {
            startLineNumber: i + 1,
            startColumn: 1,
            endLineNumber: i + 1,
            endColumn: line.length + 1,
          };
          symbols.push({
            name: `${fnName}(${params})`,
            detail: 'Function',
            kind: monacoLanguages.SymbolKind.Function,
            range,
            selectionRange: range,
            tags: [],
          });
          continue;
        }

        // Variables
        const varMatch = line.match(/(?:ধৰা|dhora)\s+([^\s=]+)\s*=/);
        if (varMatch) {
          const varName = varMatch[1];
          const range: IRange = {
            startLineNumber: i + 1,
            startColumn: 1,
            endLineNumber: i + 1,
            endColumn: line.length + 1,
          };
          symbols.push({
            name: varName,
            detail: 'Variable',
            kind: monacoLanguages.SymbolKind.Variable,
            range,
            selectionRange: range,
            tags: [],
          });
        }
      }

      return symbols;
    },
  };
}
