// Svelte 5 module-level rune: shared hacker mode state across all demo pages
let _hackerMode = $state(false)

export const hackerMode = {
  get value() {
    return _hackerMode
  },
  toggle() {
    _hackerMode = !_hackerMode
  },
  set(val: boolean) {
    _hackerMode = val
  }
}
