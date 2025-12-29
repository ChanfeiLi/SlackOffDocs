import * as React from 'react'
import { readSource } from '../lib/sourceStore'
import { useDocStore } from '../store/useDocStore'

type Props = { docId?: string }

export default function Editor({ docId }: Props) {
  const progressByDoc = useDocStore((s) => s.progressByDoc)
  const rate = useDocStore((s) => s.rate)

  const reveal = useDocStore((s) => s.reveal)
  const deleteSnippet = useDocStore((s) => s.deleteSnippet)

  const [text, setText] = React.useState<string>('')
  const composingRef = React.useRef(false)
  const editorRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    let ignore = false
      ; (async () => {
        if (!docId) { setText(''); return }
        const src = (await readSource(docId)) ?? ''
        if (!ignore) setText(src)
      })()
    return () => { ignore = true }
  }, [docId])

  const onKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    // allow system/navigation keys
    if (e.metaKey || e.ctrlKey) return;
    const nav = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];
    // ignore IME composing stage
    // @ts-ignore
    if (e.isComposing || e.nativeEvent.isComposing || e.key === 'Process' || composingRef.current) return;

    if (e.key === 'Backspace' || e.key === 'Delete') {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
        if (editorRef.current && editorRef.current.contains(selection.anchorNode)) {
          e.preventDefault();
          const range = selection.getRangeAt(0);
          const start = range.startOffset;
          const length = range.toString().length;

          deleteSnippet(text, start, length).then((newText) => {
            setText(newText);
            selection.removeAllRanges();
          });
          return;
        }
      }

      e.preventDefault();
      reveal(-rate.charsPerKeystroke); // back up same step
      return;
    }
    if (nav.includes(e.key)) return;

    e.preventDefault();
    reveal(rate.charsPerKeystroke);
  }, [rate.charsPerKeystroke, reveal, text, deleteSnippet]);

  const onCompositionStart = () => {
    composingRef.current = true
  }

  const onCompositionEnd = () => {
    composingRef.current = false
    // after IME composing, reveal one step
    reveal(rate.charsPerKeystroke)
    // force overwrite temporary text inserted during IME composing
    if (editorRef.current) {
      editorRef.current.innerText = text.slice(0, (docId ? (progressByDoc[docId] ?? 0) : 0))
    }
  }

  const onBeforeInput = (e: React.FormEvent<HTMLDivElement>) => {
    const ie = e as unknown as InputEvent
    const type = ie.inputType
    // prevent real insert/delete to contenteditable, we control the reveal
    if (type && (type.startsWith('insert') || type.startsWith('delete'))) {
      e.preventDefault()
    }
  }

  const revealIndex = docId ? (progressByDoc[docId] ?? 0) : 0
  const visible = text.slice(0, revealIndex)

  // after reveal/back up, keep cursor at the end (simulate Docs cursor always at the current typing position)
  React.useLayoutEffect(() => {
    const el = editorRef.current
    if (!el) return
    const range = document.createRange()
    const sel = window.getSelection()
    range.selectNodeContents(el)
    range.collapse(false)
    sel?.removeAllRanges()
    sel?.addRange(range)
  }, [visible])

  return (
    <div
      id="editor"
      contentEditable
      spellCheck={false}
      ref={editorRef}
      onKeyDown={onKeyDown}
      onCompositionStart={onCompositionStart}
      onCompositionEnd={onCompositionEnd}
      onBeforeInput={onBeforeInput}
      style={{ minHeight: '80vh', background: 'white', borderRadius: 4, outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '48px 56px', lineHeight: 1.7, fontSize: 16, whiteSpace: 'pre-wrap' }}
      suppressContentEditableWarning
    >
      {visible}
    </div>
  )
}


