/**
 * Ported directly from the official Asomiya VS Code extension (editors/vscode/src/vocabulary.ts).
 * Everything the editor knows about Asomiya's words, derived from the language's own glossary.
 */
import {
  BUILTIN_NAMES,
  BUILTIN_ROMAN,
  KEYWORD_GLOSSARY,
  type KeywordId,
} from 'asomiya';

export type BuiltinKey = keyof typeof BUILTIN_NAMES;

export type WordKind = 'keyword' | 'builtin';

export interface Word {
  readonly kind: WordKind;
  readonly id: KeywordId | BuiltinKey;
  /** The Assamese spelling. */
  readonly word: string;
  /** Other Assamese spellings. */
  readonly aliases: readonly string[];
  /** Spellings in English letters; the first is the preferred one. */
  readonly roman: readonly string[];
  readonly en: string;
  readonly as: string;
  /** What the same thing is called in Python. */
  readonly python: string;
  /** Call signature for built-ins. */
  readonly signature?: string;
}

const KEYWORD_INFO: Readonly<Record<KeywordId, { en: string; as: string; python: string }>> = {
  let: { en: 'Declares a variable.', as: 'নতুন চলক ঘোষণা কৰে।', python: 'x = …' },
  print: { en: 'Prints a line.', as: 'এটা শাৰী ছপা কৰে।', python: 'print()' },
  if: {
    en: 'Runs a block only if the condition is true.',
    as: 'চৰ্ত সঁচা হ’লেহে ব্লকটো চলায়।',
    python: 'if',
  },
  else: {
    en: 'Runs when the condition of যদি is false.',
    as: 'যদিৰ চৰ্ত মিছা হ’লে চলে।',
    python: 'else',
  },
  while: {
    en: 'Repeats a block while the condition is true.',
    as: 'চৰ্ত সঁচা হৈ থকালৈকে ব্লকটো বাৰে বাৰে চলায়।',
    python: 'while',
  },
  function: { en: 'Defines a function.', as: 'এটা ফাংচন সংজ্ঞাবদ্ধ কৰে।', python: 'def' },
  return: {
    en: 'Returns a value from a function.',
    as: 'ফাংচনৰ পৰা মান ঘূৰাই দিয়ে।',
    python: 'return',
  },
  break: { en: 'Leaves the loop.', as: 'লুপৰ পৰা ওলাই যায়।', python: 'break' },
  continue: {
    en: 'Skips to the next round of the loop.',
    as: 'লুপৰ পৰৱৰ্তী পাকলৈ যায়।',
    python: 'continue',
  },
  true: { en: 'The boolean value true.', as: 'বুলিয়ান মান সঁচা।', python: 'True' },
  false: { en: 'The boolean value false.', as: 'বুলিয়ান মান মিছা।', python: 'False' },
  null: { en: 'No value.', as: 'কোনো মান নাই।', python: 'None' },
  and: {
    en: 'True if both sides are true (same as &&).',
    as: 'দুয়োফাল সঁচা হ’লে সঁচা (&& ৰ দৰে)।',
    python: 'and',
  },
  or: {
    en: 'True if either side is true (same as ||).',
    as: 'যিকোনো এফাল সঁচা হ’লে সঁচা (|| ৰ দৰে)।',
    python: 'or',
  },
};

const BUILTIN_INFO: Readonly<
  Record<BuiltinKey, { en: string; as: string; python: string; signature: string }>
> = {
  length: {
    signature: '(x)',
    en: 'Length of text (in letters) or of a list.',
    as: 'পাঠৰ (আখৰত) বা তালিকাৰ দৈৰ্ঘ্য।',
    python: 'len()',
  },
  typeOf: {
    signature: '(x)',
    en: 'The type of a value, as text.',
    as: 'মানটোৰ প্ৰকাৰ, পাঠ হিচাপে।',
    python: 'type()',
  },
  toNumber: {
    signature: '(x)',
    en: 'Text → number, or খালী if it is not a number.',
    as: 'পাঠ → সংখ্যা; সংখ্যা নহ’লে খালী।',
    python: 'float()',
  },
  toText: { signature: '(x)', en: 'Any value → text.', as: 'যিকোনো মান → পাঠ।', python: 'str()' },
  toInteger: {
    signature: '(x)',
    en: 'Drops the decimal part (towards zero).',
    as: 'দশমিকৰ পিছৰ অংশ বাদ দিয়ে।',
    python: 'int()',
  },
  append: {
    signature: '(list, x)',
    en: 'Adds x to the end of a list.',
    as: 'তালিকাৰ শেষত x যোগ কৰে।',
    python: 'list.append()',
  },
  input: {
    signature: '(question?)',
    en: 'Shows the question and reads one line of input.',
    as: 'প্ৰশ্নটো দেখুৱাই এটা শাৰী ইনপুট পঢ়ে।',
    python: 'input()',
  },
};

export const WORDS: readonly Word[] = [
  ...KEYWORD_GLOSSARY.map((k): Word => ({
    kind: 'keyword',
    id: k.id,
    word: k.word,
    aliases: k.aliases,
    roman: k.roman,
    ...KEYWORD_INFO[k.id],
  })),
  ...(Object.keys(BUILTIN_NAMES) as BuiltinKey[]).map((key): Word => ({
    kind: 'builtin',
    id: key,
    word: BUILTIN_NAMES[key],
    aliases: [],
    roman: BUILTIN_ROMAN[key],
    ...BUILTIN_INFO[key],
  })),
];

/**
 * The ways one spelling can be typed: NFC and NFD, য় ড় ঢ় as one character or two, and ’ for '.
 */
export function spellings(text: string): string[] {
  const out = new Set<string>();
  for (const base of [text, text.replaceAll("'", '’')]) {
    const nfc = base.normalize('NFC');
    out.add(nfc);
    out.add(base.normalize('NFD'));
    out.add(
      nfc
        .replaceAll('\u09AF\u09BC', '\u09DF')
        .replaceAll('\u09A1\u09BC', '\u09DC')
        .replaceAll('\u09A2\u09BC', '\u09DD'),
    );
  }
  return [...out];
}

const LOOKUP = new Map<string, Word>();
for (const w of WORDS) {
  for (const s of [w.word, ...w.aliases, ...w.roman]) {
    for (const v of spellings(s)) LOOKUP.set(v.normalize('NFC'), w);
  }
}

/** The keyword or built-in spelled `text`, if any. Roman spellings are case-sensitive. */
export function lookup(text: string): Word | undefined {
  return LOOKUP.get(text.normalize('NFC').replaceAll('’', "'"));
}
