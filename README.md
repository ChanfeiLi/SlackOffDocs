## FishDoc

FishDoc is a “typing-as-reading” web app. It mimics typing in a docs editor while progressively revealing the content of a local `.txt` file. No upload is required; the file and progress are both stored locally.

### Features
- Import local `.txt` and read without uploading
- Progressive reveal engine (per-keystroke); Backspace/Delete steps backward
- Google Docs–like UI (toolbar, ruler, centered paper)
- Local persistence of reading progress and settings (IndexedDB + Zustand)
- Remove current document & resume later

### Tech Stack
- Vite + React + TypeScript
- Native `contenteditable` + custom reveal logic
- Zustand for state + IndexedDB for large text (via simple helpers)

### Project Structure
```
FishDoc/
  ├─ index.html
  ├─ public/              # static assets (favicon, etc.)
  ├─ src/
  │   ├─ components/
  │   │   ├─ Toolbar.tsx  # header + menus + formatting wrapper + ruler
  │   │   ├─ Editor.tsx   # contenteditable viewer with reveal logic
  │   │   └─ Ruler.tsx
  │   ├─ lib/
  │   │   └─ sourceStore.ts
  │   ├─ store/
  │   │   └─ useDocStore.ts
  │   ├─ App.tsx
  │   ├─ main.tsx
  │   └─ index.css
  ├─ package.json
  └─ vite.config.ts
```

### Development
```
npm install
npm run dev
```
Open the printed local URL in your browser.

### Build
```
npm run build
```
This produces a static bundle in `dist/`.

### Contribution
Contributions are welcome! 🎉  
- Open an issue for feedback or feature requests.  
- Fork the repo, create a branch, and submit a pull request for changes.  

