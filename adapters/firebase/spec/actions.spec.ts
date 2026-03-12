import { describe, expect, it, vi, beforeEach } from 'vitest'
import { getActions } from '../src/actions'

// Firebase SDK mocks — mirror the real module shape
vi.mock('firebase/firestore', () => {
  const mockDocs = [
    { id: 'doc1', data: () => ({ name: 'Alice', status: 'active' }) },
    { id: 'doc2', data: () => ({ name: 'Bob', status: 'active' }) }
  ]
  const mockSnapshot = { docs: mockDocs }

  const where = vi.fn().mockReturnValue({ _type: 'where' })
  const orderBy = vi.fn().mockReturnValue({ _type: 'orderBy' })
  const limit = vi.fn().mockReturnValue({ _type: 'limit' })
  const collection = vi.fn().mockReturnValue({ _type: 'collection' })
  const query = vi.fn().mockResolvedValue(mockSnapshot)
  const getDocs = vi.fn().mockResolvedValue(mockSnapshot)
  const addDoc = vi.fn().mockResolvedValue({ id: 'new-id' })
  const setDoc = vi.fn().mockResolvedValue(undefined)
  const updateDoc = vi.fn().mockResolvedValue(undefined)
  const deleteDoc = vi.fn().mockResolvedValue(undefined)
  const doc = vi.fn().mockReturnValue({ _type: 'docRef', id: 'doc1' })

  return { collection, query, where, orderBy, limit, getDocs, addDoc, setDoc, updateDoc, deleteDoc, doc }
})

vi.mock('firebase/functions', () => {
  const result = { data: { ok: true } }
  const callableFn = vi.fn().mockResolvedValue(result)
  const httpsCallable = vi.fn().mockReturnValue(callableFn)
  return { httpsCallable }
})

describe('getActions (firebase)', async () => {
  const { collection, query, where, orderBy, limit, getDocs, addDoc, setDoc, updateDoc, deleteDoc, doc } =
    await import('firebase/firestore')
  const { httpsCallable } = await import('firebase/functions')

  const db = { _type: 'firestore' }
  const functions = { _type: 'functions' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return an object with all action methods', () => {
    const actions = getActions(db)
    expect(actions).toEqual({
      get: expect.any(Function),
      put: expect.any(Function),
      post: expect.any(Function),
      patch: expect.any(Function),
      delete: expect.any(Function),
      call: expect.any(Function),
      connection: db
    })
  })

  describe('get', () => {
    it('should query collection without filters', async () => {
      const actions = getActions(db)
      const response = await actions.get('users')
      expect(collection).toHaveBeenCalledWith(db, 'users')
      expect(getDocs).toHaveBeenCalled()
      expect(response.data).toEqual([
        { id: 'doc1', name: 'Alice', status: 'active' },
        { id: 'doc2', name: 'Bob', status: 'active' }
      ])
      expect(response.status).toBe(200)
      expect(response.error).toBeNull()
    })

    it('should apply eq filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { status: 'eq.active' } })
      expect(where).toHaveBeenCalledWith('status', '==', 'active')
    })

    it('should apply gt filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { age: 'gt.18' } })
      expect(where).toHaveBeenCalledWith('age', '>', '18')
    })

    it('should apply gte filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { age: 'gte.18' } })
      expect(where).toHaveBeenCalledWith('age', '>=', '18')
    })

    it('should apply lt filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { age: 'lt.65' } })
      expect(where).toHaveBeenCalledWith('age', '<', '65')
    })

    it('should apply lte filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { age: 'lte.65' } })
      expect(where).toHaveBeenCalledWith('age', '<=', '65')
    })

    it('should apply neq filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { status: 'neq.deleted' } })
      expect(where).toHaveBeenCalledWith('status', '!=', 'deleted')
    })

    it('should apply in filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { role: 'in.(admin,editor)' } })
      expect(where).toHaveBeenCalledWith('role', 'in', ['admin', 'editor'])
    })

    it('should apply is.null filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { deleted_at: 'is.null' } })
      expect(where).toHaveBeenCalledWith('deleted_at', '==', null)
    })

    it('should apply is.true filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { verified: 'is.true' } })
      expect(where).toHaveBeenCalledWith('verified', '==', true)
    })

    it('should apply is.false filter', async () => {
      const actions = getActions(db)
      await actions.get('users', { filter: { deleted: 'is.false' } })
      expect(where).toHaveBeenCalledWith('deleted', '==', false)
    })

    it('should apply orderBy', async () => {
      const actions = getActions(db)
      await actions.get('users', { order: 'name.asc' })
      expect(orderBy).toHaveBeenCalledWith('name', 'asc')
    })

    it('should apply orderBy descending', async () => {
      const actions = getActions(db)
      await actions.get('users', { order: 'created_at.desc' })
      expect(orderBy).toHaveBeenCalledWith('created_at', 'desc')
    })

    it('should apply limit', async () => {
      const actions = getActions(db)
      await actions.get('users', { limit: 10 })
      expect(limit).toHaveBeenCalledWith(10)
    })

    it('should return error response on unsupported like operator', async () => {
      const actions = getActions(db)
      const response = await actions.get('users', { filter: { name: 'like.%Alice%' } })
      expect(response.error).toEqual({ message: 'Firestore does not support the "like" operator. Use eq, neq, gt, gte, lt, lte, in, or is.' })
      expect(response.status).toBe(500)
    })
  })

  describe('put', () => {
    it('should insert a new document', async () => {
      const actions = getActions(db)
      const response = await actions.put('users', { name: 'Carol' })
      expect(collection).toHaveBeenCalledWith(db, 'users')
      expect(addDoc).toHaveBeenCalledWith(expect.anything(), { name: 'Carol' })
      expect(response.data).toEqual({ id: 'new-id', name: 'Carol' })
      expect(response.status).toBe(200)
    })
  })

  describe('post', () => {
    it('should upsert a document by id', async () => {
      const actions = getActions(db)
      const response = await actions.post('users', { id: 'user-1', name: 'Carol' })
      expect(doc).toHaveBeenCalledWith(db, 'users', 'user-1')
      expect(setDoc).toHaveBeenCalledWith(expect.anything(), { name: 'Carol' }, { merge: true })
      expect(response.data).toEqual({ id: 'user-1', name: 'Carol' })
      expect(response.status).toBe(200)
    })

    it('should return error response if id is missing', async () => {
      const actions = getActions(db)
      const response = await actions.post('users', { name: 'Carol' })
      expect(response.error).toEqual({ message: 'post (upsert) requires an id field' })
      expect(response.status).toBe(500)
    })
  })

  describe('patch', () => {
    it('should update a document by id filter', async () => {
      const actions = getActions(db)
      const response = await actions.patch('users', { data: { name: 'Updated' }, filter: { id: 'eq.doc1' } })
      expect(doc).toHaveBeenCalledWith(db, 'users', 'doc1')
      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), { name: 'Updated' })
      expect(response.data).toEqual({ id: 'doc1', name: 'Updated' })
      expect(response.status).toBe(200)
    })

    it('should return error response if id filter is missing', async () => {
      const actions = getActions(db)
      const response = await actions.patch('users', { data: { name: 'x' } })
      expect(response.error).toEqual({ message: 'patch requires filter.id eq.<docId> — Firestore needs a document reference' })
      expect(response.status).toBe(500)
    })
  })

  describe('delete', () => {
    it('should delete a document by id filter', async () => {
      const actions = getActions(db)
      const response = await actions.delete('users', { filter: { id: 'eq.doc1' } })
      expect(doc).toHaveBeenCalledWith(db, 'users', 'doc1')
      expect(deleteDoc).toHaveBeenCalledWith(expect.anything())
      expect(response.status).toBe(200)
    })

    it('should return error response if id filter is missing', async () => {
      const actions = getActions(db)
      const response = await actions.delete('users')
      expect(response.error).toEqual({ message: 'delete requires filter.id eq.<docId> — Firestore needs a document reference' })
      expect(response.status).toBe(500)
    })
  })

  describe('call', () => {
    it('should call a Firebase Callable Function', async () => {
      const actions = getActions(db, functions)
      const response = await actions.call('sendWelcomeEmail', { userId: 'u1' })
      expect(httpsCallable).toHaveBeenCalledWith(functions, 'sendWelcomeEmail')
      expect(response.data).toEqual({ ok: true })
      expect(response.status).toBe(200)
    })

    it('should throw if functions client is not provided', async () => {
      const actions = getActions(db)
      await expect(actions.call('sendWelcomeEmail', {})).rejects.toThrow(
        'call requires a Firebase Functions instance'
      )
    })
  })
})
