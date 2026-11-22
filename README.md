# editor.asomiya.codes — Dedicated Web IDE for Asomiya (অসমীয়া)

> **Repository Branch:** [`editor`](https://github.com/d43ash1sh/asomiya/tree/editor) on [`d43ash1sh/asomiya`](https://github.com/d43ash1sh/asomiya)

A modern, dedicated, browser-based development environment for the **অসমীয়া (Asomiya)** programming language, designed with full **vscode.dev** visual and functional fidelity.

---

## 🌟 Key Features

- **Monaco Editor Engine**: Powered by the same editor engine as Visual Studio Code and `vscode.dev`.
- **Complete Asomiya Language Support**:
  - **Syntax Highlighting (Monarch)**: Full coloring for Assamese script keywords (`ধৰা`, `ফাংচন`, `যদি`, `নহ'লে`, `যেতিয়ালৈকে`) and Romanized Assamese (`dhora`, `fangchon`, `jodi`, `nohole`, `jetialoike`).
  - **Bilingual IntelliSense & Snippets**: Autocompletion with signatures, documentation in Assamese and English, and boilerplate templates.
  - **Rich Hover Documentation**: Displays function signatures, meanings in Assamese & English, and equivalent Python constructs.
  - **Real-Time Diagnostics**: Instant inline error squiggles using the official `asomiya` parser and lexer.
- **Virtual File System (VFS)**:
  - Multi-file workspace stored in browser `localStorage`.
  - Create, rename, delete files.
  - One-click **Export Project (.zip)** and **Import Project (.zip)** using JSZip.
  - Preloaded starter templates (Hello World, Romanized script, Recursion/Fibonacci, Algorithms, Interactive Calculator).
- **VS Code Interface & Navigation**:
  - **Activity Bar**: File Explorer, Workspace Search, Algorithm & Template Gallery, Python Translation, Interactive Cheatsheet, and Settings.
  - **Tabs Bar**: Multi-tab editing with dirty indicators and split preview.
  - **Integrated Terminal**: Standard output streaming, execution duration metrics, and interactive stdin prompt for `সোধা()` / `xodha()`.
  - **Python Live Transpiler**: Converts active Asomiya files directly into runnable Python 3 code.
  - **Status Bar**: Live line/column tracker, Assamese (০-৯) vs ASCII (0-9) digit switcher, language mode, error counters.
  - **Themes**: High-contrast VS Code Dark+ and Light+ themes with Assamese typography (Noto Sans Bengali).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20 or newer
- npm

### Development
```bash
# Navigate to the editor directory
cd E:\editor.asomiya.codes

# Start the Vite development server
npm run dev
```
Open `http://localhost:3000` in your browser.

### Production Build
```bash
npm run build
```
The static, self-contained production bundle is generated in `dist/`.

### Preview Production Build
```bash
npm run preview
```

---

## 🚢 Deployment (editor.asomiya.codes)

The `dist/` directory is purely static and can be deployed directly to:
- **Cloudflare Pages**: Point build output to `dist`
- **Vercel**: Deploy with standard Vite preset
- **Netlify**: Publish directory `dist`
- **GitHub Pages**: Host static assets from `dist`

---

## 📁 Architecture & Directory Structure

```
editor.asomiya.codes/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx                  # App entry point
│   ├── App.tsx                   # Main VS Code workbench container
│   ├── index.css                 # VS Code dark/light styles & fonts
│   ├── monaco/
│   │   ├── asomiya-language.ts   # Monarch tokenizer & language configuration
│   │   ├── asomiya-completion.ts # Autocomplete & snippets provider
│   │   ├── asomiya-hover.ts      # Hover tooltips with docs & signatures
│   │   ├── asomiya-diagnostics.ts# Real-time error squiggles
│   │   └── theme.ts              # VS Code Dark+ & Light+ themes
│   ├── components/
│   │   ├── layout/
│   │   │   ├── ActivityBar.tsx   # Left-most icon bar
│   │   │   ├── SideBar.tsx       # Collapsible view panel
│   │   │   ├── EditorHeader.tsx  # Tabs & Run/Python action buttons
│   │   │   ├── EditorArea.tsx    # Monaco Editor component
│   │   │   ├── BottomPanel.tsx   # Resizable bottom drawer
│   │   │   └── StatusBar.tsx     # VS Code bottom status bar
│   │   ├── sidebar/
│   │   │   ├── FileExplorer.tsx  # Multi-file tree and actions
│   │   │   ├── SearchPanel.tsx   # Search across project files
│   │   │   ├── TemplatesPanel.tsx# Curated algorithm templates
│   │   │   ├── DocsPanel.tsx     # Interactive keyword cheatsheet
│   │   │   └── SettingsPanel.tsx # Font, tab, digit, and step settings
│   │   └── terminal/
│   │       ├── OutputTerminal.tsx# Output stream & interactive stdin
│   │       ├── PythonPreview.tsx # Python transpiled preview
│   │       └── ProblemsView.tsx  # Compiler diagnostic list
│   ├── vfs/
│   │   ├── types.ts              # Virtual file system types
│   │   ├── defaultFiles.ts       # Initial starter programs
│   │   ├── storage.ts            # LocalStorage persistence & file CRUD
│   │   └── zip.ts                # Zip export and import
│   ├── runner/
│   │   └── execution.ts          # Asomiya engine runner & timer
│   └── types/
│       └── index.ts              # Workbench settings and tab types
```
