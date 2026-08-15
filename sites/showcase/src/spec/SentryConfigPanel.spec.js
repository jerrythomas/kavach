import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import SentryConfigPanel from '../lib/components/SentryConfigPanel.svelte'

const rules = [
	{ path: '/', roles: 'public', allowed: true },
	{ path: '/auth', roles: 'public', allowed: true },
	{ path: '/admin', roles: ['admin'], allowed: false }
]

describe('SentryConfigPanel', () => {
	it('is collapsed by default', () => {
		render(SentryConfigPanel, { rules })
		expect(screen.queryByText('/admin')).not.toBeInTheDocument()
	})

	it('expands to show every rule path and role', async () => {
		render(SentryConfigPanel, { rules })
		await fireEvent.click(screen.getByText('Sentry Config'))
		expect(screen.getByText('/')).toBeInTheDocument()
		expect(screen.getByText('/auth')).toBeInTheDocument()
		expect(screen.getByText('/admin')).toBeInTheDocument()
		expect(screen.getAllByText('public')).toHaveLength(2)
		expect(screen.getByText('admin')).toBeInTheDocument()
	})

	it('marks allowed rules with success dot and denied with danger dot', async () => {
		const { container } = render(SentryConfigPanel, { rules })
		await fireEvent.click(screen.getByText('Sentry Config'))
		const dots = [...container.querySelectorAll('span.h-2.w-2.rounded-full')]
		expect(dots).toHaveLength(3)
		expect(dots[0].className).toContain('bg-success')
		expect(dots[1].className).toContain('bg-success')
		expect(dots[2].className).toContain('bg-danger')
	})

	it('renders array roles joined by comma', async () => {
		render(SentryConfigPanel, { rules })
		await fireEvent.click(screen.getByText('Sentry Config'))
		expect(screen.getByText('admin')).toBeInTheDocument()
	})
})
