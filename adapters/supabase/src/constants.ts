// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getWindow = (): any => (typeof window !== 'undefined' ? window : null)
export const defaultOrigin: string = getWindow()?.location?.origin ?? ''
