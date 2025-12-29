import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { writeSource } from '../lib/sourceStore'

type Rate = { charsPerKeystroke: number }

type Store = {
  docId?: string
  progressByDoc: Record<string, number>
  rate: Rate
  titleByDoc: Record<string, string>
  fileNameByDoc: Record<string, string>

  setDocId: (id?: string) => void
  reveal: (n: number) => void
  setRate: (r: Partial<Rate>) => void
  setTitle: (title: string) => void
  deleteSnippet: (currentText: string, startIndex: number, length: number) => Promise<string>
  setFileName: (name: string) => void
  clearCurrent: () => void
}

export const useDocStore = create<Store>()(
  persist(
    (set, get) => ({
      docId: undefined,
      progressByDoc: {},
      titleByDoc: {},
      fileNameByDoc: {},
      rate: { charsPerKeystroke: 2 },

      setDocId: (id) => set({ docId: id }),
      reveal: (n) => {
        const id = get().docId
        if (!id) return
        const prev = get().progressByDoc[id] ?? 0
        const next = Math.max(0, Math.min(prev + n, Number.MAX_SAFE_INTEGER))
        set((s) => ({ progressByDoc: { ...s.progressByDoc, [id]: next } }))
      },
      setRate: (r) => set((s) => ({ rate: { ...s.rate, ...r } })),
      setTitle: (title) => set((s) => {
        const id = s.docId
        if (!id) return {}
        return { titleByDoc: { ...s.titleByDoc, [id]: title } }
      }),
      deleteSnippet: async (currentText, startIndex, length) => {
        const id = get().docId
        if (!id) return currentText

        const before = currentText.slice(0, startIndex)
        const after = currentText.slice(startIndex + length)
        const newText = before + after

        await writeSource(id, newText)

        set((s) => {
          const prev = s.progressByDoc[id] ?? 0
          const next = Math.max(0, prev - length)
          return { progressByDoc: { ...s.progressByDoc, [id]: next } }
        })
        return newText
      },
      setFileName: (name) => set((s) => {
        const id = s.docId
        if (!id) return {}
        return { fileNameByDoc: { ...s.fileNameByDoc, [id]: name } }
      }),
      clearCurrent: () => set((s) => {
        const id = s.docId
        if (!id) return {}
        const nextProgress = { ...s.progressByDoc }
        const nextTitle = { ...s.titleByDoc }
        const nextNames = { ...s.fileNameByDoc }
        delete nextProgress[id]
        delete nextTitle[id]
        delete nextNames[id]
        return { docId: undefined, progressByDoc: nextProgress, titleByDoc: nextTitle, fileNameByDoc: nextNames }
      }),
    }),
    {
      name: 'fishdoc-meta',
      partialize: (s) => ({
        docId: s.docId,
        progressByDoc: s.progressByDoc,
        titleByDoc: s.titleByDoc,
        fileNameByDoc: s.fileNameByDoc,
        rate: s.rate,
      }),
    },
  ),
)


