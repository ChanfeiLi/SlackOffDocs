import * as React from 'react'
import Editor from './components/Editor'
import Toolbar from './components/Toolbar'
import { useDocStore } from './store/useDocStore'

export default function App() {
  const docId = useDocStore((s) => s.docId)
  const setDocId = useDocStore((s) => s.setDocId)
  React.useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash && hash !== useDocStore.getState().docId) {
        setDocId(hash)
      }
    }

    const initHash = window.location.hash.slice(1)
    if (initHash) {
      setDocId(initHash)
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [setDocId])

  React.useEffect(() => {
    if (docId) {
       window.history.replaceState({}, document.title, `#${docId}`);
    }
  }, [docId])

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb' }}>
      <Toolbar />
      <div style={{ maxWidth: 816, margin: '24px auto 0' }}>
        <div style={{ height: 1122, background: 'white', borderRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 40 }}>
          <Editor docId={docId} key={`editor-${docId}`} />
        </div>
      </div>
    </div>
  )
}
