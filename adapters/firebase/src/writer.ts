import {
  collection as firestoreCollection,
  addDoc,
  serverTimestamp,
  type Firestore
} from 'firebase/firestore'

export function getLogWriter(db: Firestore, options: { collection?: string } = {}) {
  const collectionName = options.collection ?? 'logs'
  return {
    async write(data: Record<string, unknown>) {
      try {
        await addDoc(firestoreCollection(db, collectionName), {
          ...data,
          timestamp: serverTimestamp()
        })
      } catch {
        // swallow — log failures must not crash the app
      }
    }
  }
}
