export const testConfig = {
	globals: true,
	environment: 'jsdom',
	coverage: {
		reporter: ['html', 'lcov', 'text'],
		all: false,
		include: ['src']
	}
}
