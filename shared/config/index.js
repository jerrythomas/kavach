export const testConfig = {
  globals: true,
  environment: 'jsdom',
  coverage: {
    reporter: ['text', 'lcov'],
    all: false,
    include: ['src'],
  },
}
