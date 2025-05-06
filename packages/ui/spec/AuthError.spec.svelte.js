import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'
import AuthError from '../src/AuthError.svelte'

describe('AuthError.svelte', () => {
	beforeEach(() => {
		cleanup()
	})

	it('should render with changes', async () => {
		const props = $state({ message: 'An error occurred' })
		const { container } = render(AuthError, { props })
		expect(container).toMatchSnapshot()

		props.message = 'Something else'
		props.name = 'AuthApi'
		flushSync()
		expect(container).toMatchSnapshot()

		props.message = 'Another error'
		props.status = '400'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render error with name', () => {
		const props = $state({ message: 'An error', name: 'AuthApi' })
		const { container } = render(AuthError, { props })
		expect(container).toMatchSnapshot()
	})

	it('should render error with status', () => {
		const props = $state({ message: 'An error', status: '400' })
		const { container } = render(AuthError, { props })
		expect(container).toMatchSnapshot()
	})

	it('should render error with status & name', () => {
		const props = $state({
			message: 'An error',
			status: '400',
			name: 'AuthApi'
		})
		const { container } = render(AuthError, { props })
		expect(container).toMatchSnapshot()
	})
})
