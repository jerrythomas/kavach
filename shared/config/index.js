export const testConfig = {
	globals: true,
	environment: 'jsdom',
	coverage: {
		provider: 'istanbul',
		reporter: ['html', 'lcov', 'text'],
		all: false,
		include: ['src']
	}
}
