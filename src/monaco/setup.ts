/**
 * Load Monaco from this site's own bundle instead of the default CDN (cdn.jsdelivr.net).
 * Keeps the editor at the version pinned in package-lock.json, lets it work offline, and
 * allows a strict Content-Security-Policy (script-src 'self').
 */
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

self.MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
};

loader.config({ monaco });
