/**
 * Official VS Code extension snippets (editors/vscode/snippets/asomiya.json)
 */

export interface SnippetDefinition {
  prefix: string[];
  body: string[];
  description: string;
}

export const OFFICIAL_SNIPPETS: Record<string, SnippetDefinition> = {
  'ধৰা — variable': {
    prefix: ['ধৰা'],
    body: ['ধৰা ${1:নাম} = ${2:মান}'],
    description: 'নতুন চলক (variable)',
  },
  'কোৱা — print': {
    prefix: ['কোৱা'],
    body: ['কোৱা(${1:"নমস্কাৰ"})'],
    description: 'ছপা কৰা (print)',
  },
  'যদি — if': {
    prefix: ['যদি'],
    body: ['যদি (${1:চৰ্ত}) {', '\t$0', '}'],
    description: 'যদি (if)',
  },
  "যদি নহ'লে — if / else": {
    prefix: ['যদিনহ\'লে', 'যদি-নহ\'লে'],
    body: ['যদি (${1:চৰ্ত}) {', '\t$2', '} নহ\'লে {', '\t$0', '}'],
    description: 'যদি … নহ\'লে (if / else)',
  },
  'যেতিয়ালৈকে — while': {
    prefix: ['যেতিয়ালৈকে'],
    body: ['যেতিয়ালৈকে (${1:চৰ্ত}) {', '\t$0', '}'],
    description: 'লুপ (while)',
  },
  'গণনা লুপ — counting loop': {
    prefix: ['গণনা'],
    body: [
      'ধৰা ${1:ক} = ${2:১}',
      'যেতিয়ালৈকে (${1:ক} <= ${3:১০}) {',
      '\t$0',
      '\t${1:ক} = ${1:ক} + ১',
      '}',
    ],
    description: '১ ৰ পৰা n লৈকে গণনা (counting loop)',
  },
  'ফাংচন — function': {
    prefix: ['ফাংচন'],
    body: ['ফাংচন ${1:নাম}(${2:ক}) {', '\tঘূৰাইদিয়া ${0:ক}', '}'],
    description: 'ফাংচন (function)',
  },
  'সোধা — input': {
    prefix: ['সোধা'],
    body: ['ধৰা ${1:উত্তৰ} = সোধা("${2:আপোনাৰ নাম কি?} ")'],
    description: 'ইনপুট লোৱা (input)',
  },
  'dhora — variable': {
    prefix: ['dhora', 'let'],
    body: ['dhora ${1:naam} = ${2:value}'],
    description: 'Declare a variable (ধৰা)',
  },
  'kowa — print': {
    prefix: ['kowa', 'print'],
    body: ['kowa(${1:"Nomoskar"})'],
    description: 'Print a line (কোৱা)',
  },
  'jodi — if': {
    prefix: ['jodi', 'if'],
    body: ['jodi (${1:condition}) {', '\t$0', '}'],
    description: 'if (যদি)',
  },
  'jodi nohole — if / else': {
    prefix: ['jodinohole', 'ifelse'],
    body: ['jodi (${1:condition}) {', '\t$2', '} nohole {', '\t$0', '}'],
    description: 'if / else (যদি … নহ\'লে)',
  },
  'jetialoike — while': {
    prefix: ['jetialoike', 'while'],
    body: ['jetialoike (${1:condition}) {', '\t$0', '}'],
    description: 'while loop (যেতিয়ালৈকে)',
  },
  'counting loop': {
    prefix: ['for', 'gonona'],
    body: [
      'dhora ${1:i} = ${2:1}',
      'jetialoike (${1:i} <= ${3:10}) {',
      '\t$0',
      '\t${1:i} = ${1:i} + 1',
      '}',
    ],
    description: 'Count from 1 to n',
  },
  'fangchon — function': {
    prefix: ['fangchon', 'function', 'def'],
    body: ['fangchon ${1:naam}(${2:x}) {', '\tghuraidiya ${0:x}', '}'],
    description: 'function (ফাংচন)',
  },
  'xudha — input': {
    prefix: ['xudha', 'input'],
    body: ['dhora ${1:uttor} = xudha("${2:Apunar naam ki?} ")'],
    description: 'Read a line of input (সোধা)',
  },
};
