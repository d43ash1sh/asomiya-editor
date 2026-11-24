import type { languages } from 'monaco-editor';
import { KEYWORD_GLOSSARY, BUILTIN_NAMES, BUILTIN_ROMAN } from 'asomiya';

export const LANGUAGE_ID = 'asomiya';

// Collect all keywords in Assamese and Roman letters
const assameseKeywords: string[] = [];
const romanKeywords: string[] = [];

for (const entry of KEYWORD_GLOSSARY) {
  assameseKeywords.push(entry.word);
  if (entry.aliases) assameseKeywords.push(...entry.aliases);
  if (entry.roman) romanKeywords.push(...entry.roman);
}

// Collect all built-ins
const assameseBuiltins: string[] = Object.values(BUILTIN_NAMES);
const romanBuiltins: string[] = Object.values(BUILTIN_ROMAN).flat();

export const languageConfiguration: languages.LanguageConfiguration = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/'],
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"', notIn: ['string', 'comment'] },
    { open: '/*', close: ' */', notIn: ['string'] },
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
  ],
  wordPattern: /[A-Za-z0-9_\u0980-\u09FF\u200C\u200D]+/,
  indentationRules: {
    increaseIndentPattern: /^.*\{[^}"']*$/,
    decreaseIndentPattern: /^\s*\}/,
  },
  folding: {
    markers: {
      start: /^\s*\/\/\s*#?region\b/,
      end: /^\s*\/\/\s*#?endregion\b/,
    },
  },
};

export const monarchLanguage: languages.IMonarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.asomiya',

  keywords: [...new Set([...assameseKeywords, ...romanKeywords])],
  builtins: [...new Set([...assameseBuiltins, ...romanBuiltins])],
  constants: ['সঁচা', 'মিছা', 'খালী', 'xosa', 'misa', 'khali', 'true', 'false', 'null'],

  operators: [
    '=', '==', '!=', '<', '<=', '>', '>=',
    '+', '-', '*', '/', '%',
    '&&', '||', '!', 'আৰু', 'বা', 'নহয়', 'aru', 'ba', 'nohoy',
  ],

  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  tokenizer: {
    root: [
      // Identifiers and keywords
      [
        /[\p{L}_][\p{L}\p{M}\p{N}_\u200C\u200D]*/u,
        {
          cases: {
            '@constants': 'constant.language',
            '@keywords': 'keyword',
            '@builtins': 'support.function',
            '@default': 'identifier',
          },
        },
      ],

      // Whitespace
      { include: '@whitespace' },

      // Delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [
        /@symbols/,
        {
          cases: {
            '@operators': 'operator',
            '@default': '',
          },
        },
      ],

      // Numbers: Assamese digits ০-৯ and Arabic digits 0-9
      [/[0-9০-৯]+(\.[0-9০-৯]+)?/, 'number'],

      // Delimiter: comma, semicolon
      [/[,;]/, 'delimiter'],

      // Strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
      [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
    ],

    comment: [
      [/[^\/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'], // nested comment
      ['\\*/', 'comment', '@pop'],
      [/[\/*]/, 'comment'],
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],
  },
};
