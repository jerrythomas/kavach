import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import RoleCard from '../lib/components/RoleCard.svelte'

const routes = [
	{ path: '/dashboard', roles: '*', allowed: true },
	{ path: '/data', roles: '*', allowed: true },
	{ path: '/admin', roles: ['admin'], allowed: false }
]

describe('RoleCard', () => {
	it('shows the role badge', () => {
		render(RoleCard, { role: 'admin', routes })
		expect(screen.getByText('admin')).toBeInTheDocument()
	})

	it('shows unauthenticated fallback when role is null', () => {
		render(RoleCard, { role: null, routes })
		expect(screen.getByText('unauthenticated')).toBeInTheDocument()
	})

	it('marks admin role with the warning token', () => {
		const { container } = render(RoleCard, { role: 'admin', routes })
		expect(container.querySelector('span.font-mono')?.className).toContain('text-warning')
	})

	it('renders every route path', () => {
		const { container } = render(RoleCard, { role: 'user', routes })
		for (const route of routes) {
			expect(container.textContent).toContain(route.path)
		}
	})

	it('strikes through disallowed routes', () => {
		const { container } = render(RoleCard, { role: 'user', routes })
		const adminRow = [...container.querySelectorAll('div.flex.items-center.gap-2')].find((el) =>
			el.textContent.includes('/admin')
		)
		expect(adminRow).not.toBeNull()
		expect(adminRow?.querySelector('span.line-through')).not.toBeNull()
	})

	it('shows allowed routes unstruck and with success colour', () => {
		const { container } = render(RoleCard, { role: 'user', routes })
		const dashRow = [...container.querySelectorAll('div.flex.items-center.gap-2')].find((el) =>
			el.textContent.includes('/dashboard')
		)
		expect(dashRow?.querySelector('span.line-through')).toBeNull()
		expect(dashRow?.querySelector('.text-success')).not.toBeNull()
	})
})
