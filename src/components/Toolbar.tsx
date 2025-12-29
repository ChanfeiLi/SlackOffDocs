import { AlignLeft, ChevronDown, CloudDrizzle, Folder, Highlighter, Image as ImageIcon, Indent, LineChart, Link as LinkIcon, List, Minus, MoreHorizontal, Outdent, Plus, Printer, Redo, Search, Share, Star, Table, Type, Undo } from 'lucide-react'
import * as React from 'react'
import { hashText, readSource, writeSource } from '../lib/sourceStore'
import { useDocStore } from '../store/useDocStore'
import Ruler from './Ruler'

export default function Toolbar() {
  const keepFocus = (e: React.MouseEvent) => e.preventDefault()
  const docId = useDocStore((s) => s.docId)
  const setDocId = useDocStore((s) => s.setDocId)
  const rate = useDocStore((s) => s.rate)
  const setRate = useDocStore((s) => s.setRate)
  const progressByDoc = useDocStore((s) => s.progressByDoc)
  const fileNameByDoc = useDocStore((s) => s.fileNameByDoc)
  const setFileName = useDocStore((s) => s.setFileName)

  const clearCurrent = useDocStore((s) => s.clearCurrent)
  const setTitle = useDocStore((s) => s.setTitle)
  const titleByDoc = useDocStore((s) => s.titleByDoc)

  const currentTitle = docId ? (titleByDoc[docId] || 'Untitled document') : 'Untitled document'
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [tempTitle, setTempTitle] = React.useState('')
  const revealIndex = docId ? (progressByDoc[docId] ?? 0) : 0
  const [docLength, setDocLength] = React.useState<number>(0)
  const [showFileMenu, setShowFileMenu] = React.useState(false)
  const [hoverRemove, setHoverRemove] = React.useState(false)
  const closeTimerRef = React.useRef<number | null>(null)

  const cancelClose = () => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }
  const scheduleClose = () => {
    cancelClose()
    closeTimerRef.current = window.setTimeout(() => setShowFileMenu(false), 120)
  }

  React.useEffect(() => {
    let ignore = false
      ; (async () => {
        if (!docId) { if (!ignore) setDocLength(0); return }
        const txt = (await readSource(docId)) ?? ''
        if (!ignore) setDocLength(txt.length)
      })()
    return () => { ignore = true }
  }, [docId])

  const onFile = async (file: File) => {
    const text = await file.text()
    const id = docId || await hashText(text)
    await writeSource(id, text)
    if (id !== docId) setDocId(id)
    setFileName(file.name)
  }

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type && f.type !== 'text/plain') { alert('仅支持 .txt'); return }
    await onFile(f)
    e.currentTarget.value = ''
  }
  return (
    <div style={{ background: '#f9fbfd', position: 'sticky', top: 0, zIndex: 30, padding: '8px 16px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="logo" style={{ height: 40, width: 'auto' }} />
          </div>

          {/* Two-row layout for document info and menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Top row: Document Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isEditingTitle ? (
                <input
                  autoFocus
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={() => {
                    setTitle(tempTitle || 'Untitled document')
                    setIsEditingTitle(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setTitle(tempTitle || 'Untitled document')
                      setIsEditingTitle(false)
                    }
                  }}
                  style={{ fontSize: 18, color: '#444746', fontWeight: 500, border: '1px solid #1a73e8', borderRadius: 4, padding: '0 4px', outline: 'none' }}
                />
              ) : (
                <span
                  onDoubleClick={() => {
                    if (docId) {
                      setTempTitle(currentTitle)
                      setIsEditingTitle(true)
                    }
                  }}
                  style={{ fontSize: 18, color: '#444746', fontWeight: 500, cursor: docId ? 'text' : 'default' }}
                >
                  {currentTitle}
                </span>
              )}
              <Star size={20} color="#9ca3af" />
              <Folder size={20} color="#9ca3af" />
              <CloudDrizzle size={20} color="#9ca3af" />

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12, color: '#202124', marginLeft: 8 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #e5e7eb', padding: '4px 8px', borderRadius: 8, cursor: 'pointer' }}>
                  Import txt
                  <input type="file" accept=".txt,text/plain" onChange={onPick} style={{ display: 'none' }} />
                </label>
                <div style={{ color: '#6b7280' }}>{docId ? `Doc: ${fileNameByDoc[docId] || docId.slice(0, 8) + '…'}` : 'No document loaded'}</div>
                <div style={{ width: 1, height: 14, background: '#e5e7eb' }} />
                <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  Chars per keystroke
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={rate.charsPerKeystroke}
                    onChange={(e) => setRate({ charsPerKeystroke: Math.max(1, Number(e.target.value || 1)) })}
                    style={{ width: 48, height: 22, fontSize: 12, padding: '0 6px', border: '1px solid #e5e7eb', borderRadius: 4 }}
                  />
                  chars
                </label>
                <div style={{ color: '#6b7280' }}>Progress: {docLength > 0 ? Math.min(100, Math.round((revealIndex / docLength) * 100)) : 0}%</div>
              </div>
            </div>

            {/* Bottom row: Menu Items */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

              <div
                style={{ position: 'relative' }}
                onMouseEnter={() => { setShowFileMenu(true); cancelClose() }}
                onMouseLeave={scheduleClose}
              >
                <span
                  onMouseDown={keepFocus}
                  onClick={() => { setShowFileMenu((v) => !v); cancelClose() }}
                  style={{ cursor: 'default', fontSize: 13 }}
                >
                  File
                </span>
                {showFileMenu && (
                  <div
                    style={{ position: 'absolute', left: 0, marginTop: 6, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 8px 20px rgba(0,0,0,0.08)', minWidth: 200, zIndex: 60, padding: 6 }}
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                  >
                    <button
                      onMouseDown={(e) => { e.preventDefault(); clearCurrent(); setShowFileMenu(false) }}
                      onMouseEnter={() => setHoverRemove(true)}
                      onMouseLeave={() => setHoverRemove(false)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        background: hoverRemove ? '#f3f4f6' : 'white',
                        border: 'none',
                        color: '#111827',
                        borderRadius: 6,
                      }}
                    >
                      Remove current document
                    </button>
                  </div>
                )}
              </div>
              {['Edit', 'View', 'Insert', 'Format', 'Tools', 'Extensions', 'Help'].map((item) => (
                <span key={item} style={{ fontSize: 13 }}>{item}</span>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Side Controls */}
        <div style={{ display: 'flex' }}>
          <button onMouseDown={keepFocus} tabIndex={-1} style={{ height: 36, padding: '0 16px', borderRadius: 18, background: '#1a73e8', border: '1px solid #1669d9', color: 'white', display: 'inline-flex', alignItems: 'center', fontWeight: 500 }}>
            <Share size={16} style={{ marginRight: 8 }} />
            Share
            <ChevronDown size={14} style={{ marginLeft: 6 }} />
          </button>

          <img src="/avatar.png" alt="avatar" style={{ marginLeft: "16px", height: 40, width: 40, borderRadius: 20, objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 16px', overflowX: 'auto', background: '#f0f4f9', color: '#444746', borderRadius: 16, width: '100%' }}>
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><Search size={14} /></button>
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><Undo size={14} /></button>
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><Redo size={14} /></button>
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><Printer size={14} /></button>
        <div style={{ width: 1, height: 20, background: '#d1d5db', margin: '0 6px' }} />
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}>100% <ChevronDown size={12} style={{ marginLeft: 4 }} /></button>
        <div style={{ width: 1, height: 20, background: '#d1d5db', margin: '0 6px' }} />
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent', color: '#58595b' }}>Normal text <ChevronDown size={12} style={{ marginLeft: 6 }} /></button>
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent', color: '#58595b' }}>Arial <ChevronDown size={12} style={{ marginLeft: 6 }} /></button>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><Minus size={12} /></button>
          <button style={{ height: 24, minWidth: 36, padding: '0 6px', borderRadius: 6, background: '#f0f4f9', border: '1px solid #d1d5db' }}>11</button>
          <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><Plus size={12} /></button>
        </div>
        <div style={{ width: 1, height: 20, background: '#d1d5db', margin: '0 6px' }} />
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><Type size={14} /><ChevronDown size={12} style={{ marginLeft: 4 }} /></button>
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><Highlighter size={14} /><ChevronDown size={12} style={{ marginLeft: 4 }} /></button>
        <div style={{ width: 1, height: 20, background: '#d1d5db', margin: '0 6px' }} />
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><LinkIcon size={14} /></button>
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><ImageIcon size={14} /></button>
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><Table size={14} /></button>
        <div style={{ width: 1, height: 20, background: '#d1d5db', margin: '0 6px' }} />
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><AlignLeft size={14} /><ChevronDown size={12} style={{ marginLeft: 4 }} /></button>
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><LineChart size={14} /><ChevronDown size={12} style={{ marginLeft: 4 }} /></button>
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><List size={14} /><ChevronDown size={12} style={{ marginLeft: 4 }} /></button>
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><Outdent size={14} /></button>
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><Indent size={14} /></button>
        <div style={{ width: 1, height: 20, background: '#d1d5db', margin: '0 6px' }} />
        <button onMouseDown={keepFocus} tabIndex={-1} aria-disabled style={{ height: 24, minWidth: 24, padding: '0 4px', borderRadius: 6, background: 'transparent', border: '1px solid transparent' }}><MoreHorizontal size={14} /></button>
      </div>

      <Ruler pageWidthPx={816} />
    </div>
  )
}

