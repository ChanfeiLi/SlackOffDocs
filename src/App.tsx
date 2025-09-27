import * as React from 'react'
import Toolbar from './components/Toolbar'
import Editor from './components/Editor'
import { useDocStore } from './store/useDocStore'
import { hashText, writeSource } from './lib/sourceStore'

export default function App() {
  const docId = useDocStore((s) => s.docId)
  const setDocId = useDocStore((s) => s.setDocId)
  const revealIndex = useDocStore((s) => {
    const id = s.docId
    return id ? (s.progressByDoc[id] ?? 0) : 0
  })

  const onFile = async (file: File) => {
    const text = await file.text()
    const id = await hashText(text)
    await writeSource(id, text)
    setDocId(id)
  }

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.type && f.type !== 'text/plain') {
      alert('Only support txt files')
      return
    }
    await onFile(f)
    e.currentTarget.value = ''
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb' }}>
        <Toolbar />
        <div style={{ maxWidth: 816, margin: '24px auto 0' }}>
          <div style={{ height: 1122, background: 'white', borderRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 40 }}>
            <Editor docId={docId} />
          </div>
        </div>
    </div>
  )
}



