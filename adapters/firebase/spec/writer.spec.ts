import { getLogWriter } from '../src/writer'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

vi.mock('firebase/firestore', () => ({
  collection: vi.fn().mockReturnValue('colRef'),
  addDoc: vi.fn().mockResolvedValue({ id: 'doc123' }),
  serverTimestamp: vi.fn().mockReturnValue('__timestamp__')
}))

describe('getLogWriter (firebase)', () => {
  const db = {} as any
  beforeEach(() => vi.clearAllMocks())

  it('returns a writer with a write function', () => {
    const writer = getLogWriter(db)
    expect(writer).toEqual({ write: expect.any(Function) })
  })

  it('writes to the default "logs" collection', async () => {
    const writer = getLogWriter(db)
    await writer.write({ level: 'info', message: 'hello' })
    expect(collection).toHaveBeenCalledWith(db, 'logs')
    expect(addDoc).toHaveBeenCalledWith('colRef', {
      level: 'info',
      message: 'hello',
      timestamp: '__timestamp__'
    })
  })

  it('uses a custom collection name when provided', async () => {
    const writer = getLogWriter(db, { collection: 'audit' })
    await writer.write({ level: 'error', message: 'oops' })
    expect(collection).toHaveBeenCalledWith(db, 'audit')
  })

  it('swallows errors silently — log failures must not crash the app', async () => {
    vi.mocked(addDoc).mockRejectedValueOnce(new Error('Firestore error'))
    const writer = getLogWriter(db)
    await expect(writer.write({ message: 'hello' })).resolves.toBeUndefined()
  })
})
