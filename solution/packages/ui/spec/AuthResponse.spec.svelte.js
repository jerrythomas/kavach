import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'
import AuthResponse from '../src/AuthResponse.svelte'

describe('AuthResponse.svelte', () => {
	beforeEach(() => {
		cleanup()
	})

	it('should render response with changes', () => {
		const props = $state({})
		const { container } = render(AuthResponse, { props })
		expect(container).toMatchSnapshot()
		props.message = 'Successfully logged in'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render response with error', () => {
		const props = $state({ message: 'An error occurred', error: true })
		const { container } = render(AuthResponse, { props })
		expect(container).toMatchSnapshot()
	})
})
