import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  limit as firestoreLimit,
  type QueryConstraint
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { parseFilter, parseQueryParams } from '@kavach/query'
import type { ActionResponse } from 'kavach'

// Maps kavach PostgREST-style operators to Firestore operators
const FIRESTORE_OP: Record<string, string> = {
  eq: '==',
  neq: '!=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  in: 'in',
  is: '=='
}

const UNSUPPORTED_OPS = new Set(['like', 'ilike', 'cs', 'cd', 'ov', 'sl', 'sr', 'nxr', 'nxl', 'adj'])

function normalizeResponse(data: unknown, error: unknown = null): ActionResponse {
  return {
    data: data ?? null,
    error: error ?? null,
    status: error ? 500 : 200
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getActions(db: any, functions?: any) {
  async function get(entity: string, data?: Record<string, unknown>): Promise<ActionResponse> {
    try {
      const { filters, orders, limit } = parseQueryParams(data as Record<string, string>)
      const constraints: QueryConstraint[] = []

      for (const { column, op, value } of filters) {
        if (UNSUPPORTED_OPS.has(op)) {
          throw new Error(`Firestore does not support the "${op}" operator. Use eq, neq, gt, gte, lt, lte, in, or is.`)
        }
        const firestoreOp = FIRESTORE_OP[op]
        if (firestoreOp) {
          if (op === 'in') {
            constraints.push(where(column, 'in', value as string[]))
          } else {
            constraints.push(where(column, firestoreOp as '==' | '!=' | '>' | '>=' | '<' | '<=', value ?? null))
          }
        }
      }

      for (const { column, ascending } of orders) {
        constraints.push(orderBy(column, ascending ? 'asc' : 'desc'))
      }

      if (limit !== undefined) {
        constraints.push(firestoreLimit(limit))
      }

      const q = query(collection(db, entity), ...constraints)
      const snapshot = await getDocs(q)
      const docs = snapshot.docs.map((d: { id: string; data: () => Record<string, unknown> }) => ({
        id: d.id,
        ...d.data()
      }))
      return normalizeResponse(docs)
    } catch (error) {
      return normalizeResponse(null, { message: (error as Error).message })
    }
  }

  async function put(entity: string, data: Record<string, unknown>): Promise<ActionResponse> {
    try {
      const ref = await addDoc(collection(db, entity), data)
      return normalizeResponse({ id: ref.id, ...data })
    } catch (error) {
      return normalizeResponse(null, { message: (error as Error).message })
    }
  }

  async function post(entity: string, data: Record<string, unknown>): Promise<ActionResponse> {
    try {
      const { id, ...rest } = data as { id?: string } & Record<string, unknown>
      if (!id) throw new Error('post (upsert) requires an id field')
      const docRef = doc(db, entity, id)
      await setDoc(docRef, rest, { merge: true })
      return normalizeResponse({ id, ...rest })
    } catch (error) {
      return normalizeResponse(null, { message: (error as Error).message })
    }
  }

  async function patch(
    entity: string,
    input?: { data?: Record<string, unknown>; filter?: Record<string, string> }
  ): Promise<ActionResponse> {
    try {
      const { data = {}, filter = {} } = input ?? {}
      const filters = parseFilter(filter)
      const idFilter = filters.find((f) => f.column === 'id' && f.op === 'eq')
      if (!idFilter) throw new Error('patch requires filter.id eq.<docId> — Firestore needs a document reference')
      const docRef = doc(db, entity, idFilter.value as string)
      await updateDoc(docRef, data)
      return normalizeResponse({ id: idFilter.value, ...data })
    } catch (error) {
      return normalizeResponse(null, { message: (error as Error).message })
    }
  }

  async function del(
    entity: string,
    input?: { filter?: Record<string, string> }
  ): Promise<ActionResponse> {
    try {
      const { filter = {} } = input ?? {}
      const filters = parseFilter(filter)
      const idFilter = filters.find((f) => f.column === 'id' && f.op === 'eq')
      if (!idFilter) throw new Error('delete requires filter.id eq.<docId> — Firestore needs a document reference')
      const docRef = doc(db, entity, idFilter.value as string)
      await deleteDoc(docRef)
      return normalizeResponse({ id: idFilter.value })
    } catch (error) {
      return normalizeResponse(null, { message: (error as Error).message })
    }
  }

  async function call(entity: string, data: Record<string, unknown>): Promise<ActionResponse> {
    if (!functions) {
      throw new Error('call requires a Firebase Functions instance — pass it as the second argument to getActions(db, functions)')
    }
    try {
      const fn = httpsCallable(functions, entity)
      const result = await fn(data)
      return normalizeResponse(result.data)
    } catch (error) {
      return normalizeResponse(null, { message: (error as Error).message })
    }
  }

  return { get, put, post, patch, delete: del, call, connection: db }
}
