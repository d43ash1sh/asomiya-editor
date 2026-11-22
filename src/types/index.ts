import type { DigitSetting, MessageLanguage } from 'asomiya';

export type ActivityTab = 'explorer' | 'search' | 'templates' | 'python' | 'docs' | 'settings';

export type PanelTab = 'terminal' | 'python' | 'problems';

export interface EditorSettings {
  theme: 'dark' | 'light';
  fontSize: number;
  tabSize: number;
  digits: DigitSetting;
  lang: MessageLanguage;
  maxSteps: number;
  maxDepth: number;
}
