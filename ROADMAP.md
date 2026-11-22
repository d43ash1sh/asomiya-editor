# Asomiya Web Editor (`editor.asomiya.codes`) — Status & Roadmap

> **Target Platform:** Dedicated browser-based IDE for the **অসমীয়া (Asomiya)** programming language.  
> **Workspace Directory:** `E:\editor.asomiya.codes` (Completely isolated from the main language repo `E:\asomiya`).  
> **Tech Stack:** React 19, TypeScript 5.7, Vite 6.4, Monaco Editor (`@monaco-editor/react`), Lucide React, JSZip.

---

## 📌 Architecture Overview

```
editor.asomiya.codes/
├── src/
│   ├── main.tsx                  # Application bootstrap
│   ├── App.tsx                   # Main VS Code workbench container & keyboard shortcuts
│   ├── index.css                 # Matched asomiya.codes styles & Kohinoor Bangla fonts
│   ├── types/                    # Workbench state & settings types
│   ├── monaco/
│   │   ├── vocabulary.ts         # Ported from VS Code extension (lookup, spellings, NFC/NFD)
│   │   ├── service.ts            # Ported from VS Code extension (describe, completions, python)
│   │   ├── snippets.ts           # All 16 official extension snippets
│   │   ├── asomiya-language.ts   # Monarch tokenizer & language configuration (wordPattern, pairs)
│   │   ├── asomiya-completion.ts # Context-aware autocomplete & snippet provider
│   │   ├── asomiya-hover.ts      # Rich Markdown hover cards matching VS Code extension
│   │   ├── asomiya-diagnostics.ts# Real-time compiler error squiggles
│   │   ├── asomiya-formatter.ts  # AST & token document formatter (Shift+Alt+F)
│   │   ├── asomiya-codeactions.ts# Quick-fix lightbulb for typos & script conversions
│   │   ├── asomiya-definition.ts # Go to Definition (F12) & Document Symbols (Ctrl+Shift+O)
│   │   └── theme.ts              # asomiya.codes Dark+ and Light+ Monaco themes
│   ├── components/
│   │   ├── layout/               # ActivityBar, SideBar, EditorHeader, EditorArea, BottomPanel, StatusBar
│   │   ├── sidebar/              # FileExplorer, SearchPanel, TemplatesPanel, DocsPanel, SettingsPanel
│   │   └── terminal/             # OutputTerminal, PythonPreview, ProblemsView
│   ├── vfs/
│   │   ├── types.ts              # Virtual file system definitions
│   │   ├── defaultFiles.ts       # Starter templates (hello, roman, fibonacci, calculator)
│   │   ├── storage.ts            # LocalStorage persistence & file CRUD
│   │   ├── zip.ts                # Zip export and import via JSZip
│   │   ├── share.ts              # Unicode-safe URL hash snippet sharing (#code=...)
│   │   └── nativeFolder.ts       # File System Access API (showDirectoryPicker)
│   └── runner/
│       └── execution.ts          # Asomiya engine runner, stdin queuing & timer
├── dist/                         # Production static web build
└── package.json
```

---

## ✅ Completed Implementations

### 1. Monaco Editor & Core Language Services
- [x] **Monarch Syntax Highlighting**: Custom tokenizer supporting both **অসমীয়া script** and **Romanized Assamese** (`dhora`, `kowa`, `jodi`, `nohole`), numbers (`০-৯` and `0-9`), strings, comments, and operators.
- [x] **Ported VS Code Extension Engine**:
  - `vocabulary.ts`: Normalized spellings (`য়`, `ড়`, `ঢ়`, NFC/NFD, curly quotes `’` vs `'`).
  - `service.ts`: Script-aware autocomplete (`completions()`) prioritizing Assamese or Roman based on source context.
  - Hover help (`describe()`): Call signatures, bilingual descriptions, and Python syntax equivalents.
- [x] **Official Extension Snippets**: All 16 snippets from `editors/vscode/snippets/asomiya.json` with tabstops for both scripts.
- [x] **Language Configuration**:
  - Word pattern: `/[A-Za-z0-9_\u0980-\u09FF\u200C\u200D]+/` for Assamese conjuncts and vowel signs.
  - Auto-closing pairs and surrounding pairs for quotes, brackets, and block comments.
  - Indentation rules and `#region` / `#endregion` folding markers.
- [x] **Document Formatter (`Shift + Alt + F`)**: Indents blocks, cleans whitespace, and formats `} নহ'লে {` / `} nohole {`.
- [x] **Code Actions & Quick-Fixes (`Ctrl + .`)**:
  - Auto-fix suggestions for compiler typos (e.g. `kowaa` → `কোৱা`).
  - Bidirectional script refactoring (Convert keyword between Assamese and Roman).
- [x] **Go to Definition (`F12`) & Symbols (`Ctrl + Shift + O`)**:
  - Jump directly to `ফাংচন` / `fangchon` or `ধৰা` / `dhora` declarations.
  - Breadcrumb and symbol list generation.

### 2. Design System & Typography
- [x] **Website Theme Matching**: Replicated the official `asomiya.codes` palette from `website/styles.css`:
  - **Light Theme**: Cotton canvas (`#fafaf9`), stone ink (`#292524`), vibrant accent (`#3f40fa`), tea green (`#16a34a`).
  - **Dark Theme**: Deep mist surface (`#1c1917`), cotton background (`#141210`), lavender accent (`#7072ff`), mint tea (`#4ade80`).
- [x] **Font Stack (`Kohinoor Bangla`)**:
  - Local font priority: `Kohinoor Bangla` with `Noto Sans Bengali` web fallback.
  - Line height configured at `1.65`–`1.7` in editor and terminal to eliminate vertical diacritic clipping.
- [x] **Branding Elements**: Distinctive gold badge (`#f2c14e`) with Assamese letter **'অ'** linking to `asomiya.codes`.

### 3. Workbench, File System & Tooling
- [x] **Virtual File System (VFS)**: Multi-file tree stored in `localStorage` with full CRUD.
- [x] **File System Access API**: Native folder opening via `showDirectoryPicker()` to mount local computer folders.
- [x] **Zip Export & Import**: One-click download/upload of full projects as `.zip`.
- [x] **Side-by-Side Split View**: Dual-column layout comparing Asomiya code on the left with live transpiled Python on the right.
- [x] **Shareable URL Snippets**: UTF-8 Base64 serialization via `#code=...` for sharing runnable programs.
- [x] **Interactive Terminal**: Stdout streaming, execution timer (ms), and an interactive stdin input bar for `সোধা()` / `xodha()`.
- [x] **Save as Python**: Dedicated `.py` download action in the Python preview pane.

---

## 🚀 Roadmap: Features to Implement Next

The following items are prioritized for subsequent agent iterations:

### Priority 1: Interactive Step Debugger & Scope Inspector
- **Goal:** Allow developers to debug Asomiya code line-by-line in the browser.
- **Tasks:**
  1. Add gutter breakpoint toggles in Monaco (`monaco.editor.deltaDecorations`).
  2. Implement a step evaluator in `src/runner/` that pauses on breakpoint AST nodes.
  3. Create a **Run & Debug** sidebar view displaying:
     - Call stack frames
     - Variables in the current lexical scope (`Environment`)
     - Controls: **Resume (`F5`)**, **Step Over (`F10`)**, **Step Into (`F11`)**, **Stop (`Shift+F5`)**.

### Priority 2: Terminal Upgrade to `xterm.js`
- **Goal:** True ANSI terminal with interactive command prompt and history.
- **Tasks:**
  1. Add `xterm` and `@xterm/addon-fit` to `package.json`.
  2. Mount `xterm.js` in `OutputTerminal.tsx`.
  3. Implement full interactive REPL mode where typing `asomiya` starts an interactive Assamese prompt with arrow-key history (`↑`/`↓`).

### Priority 3: Multi-File Imports (`আমদানি` / `import`)
- **Goal:** Enable multi-file modular code inside the virtual workspace.
- **Tasks:**
  1. Extend `src/runner/execution.ts` to intercept `import` / `আমদানি` statements.
  2. Resolve the imported path against `project.files` in the VFS.
  3. Evaluate and export symbols to the calling file's lexical environment.

### Priority 4: On-Screen Phonetic Assamese Virtual Keyboard
- **Goal:** Enable users on English-only operating systems to type Assamese script effortlessly.
- **Tasks:**
  1. Build a collapsible virtual keyboard component docked above the bottom panel.
  2. Implement an optional phonetic transliteration mode (typing `oxom` in the editor converts to `অসম`).

### Priority 5: GitHub Integration
- **Goal:** Seamless cloning and committing to GitHub repositories.
- **Tasks:**
  1. Support URL parameters: `editor.asomiya.codes/?github=username/repo`.
  2. Use GitHub REST API (Octokit) to fetch repository trees and commit changes using personal access tokens.

### Priority 6: Progressive Web App (PWA) Offline Support
- **Goal:** Allow installing the editor as an offline desktop/tablet application.
- **Tasks:**
  1. Add `manifest.json` with Asomiya app icons.
  2. Register a Service Worker (`vite-plugin-pwa` or vanilla) to cache assets and enable 100% offline development.

---

## 🛠️ Developer Commands

```bash
# Workspace location
cd E:\editor.asomiya.codes

# Run development server
npm run dev

# Compile TypeScript and build production bundle
npm run build

# Preview production build
npm run preview
```
