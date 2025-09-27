import { get, set, del } from 'idb-keyval'

const KEY_PREFIX = 'fishdoc-source-'

export async function readSource(docId: string): Promise<string | undefined> {
  return get(KEY_PREFIX + docId)
}

export async function writeSource(docId: string, text: string): Promise<void> {
  await set(KEY_PREFIX + docId, text)
}

export async function deleteSource(docId: string): Promise<void> {
  await del(KEY_PREFIX + docId)
}

export async function hashText(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-1', enc)
  const bytes = Array.from(new Uint8Array(buf))
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}


