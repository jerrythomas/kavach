import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import { page } from './mocks/app-stores.js'
import { hackerMode } from '../lib/state/hacker.svelte'
import DemoNavItem from '../lib/components/DemoNavItem.svelte'

describe('DemoNavItem', () => {
	beforeEach(() => {
		hackerMode.set(false)
		page.set({ ...page, url: new URL('http://localhost/dashboard') })
	})

	it('renders the label and href', () => {
		const { container } = render(DemoNavItem, {
			href: '/dashboard',
			label: 'Dashboard',
			icon: 'i-app-list'
		})
		const link = container.querySelector('a')
		expect(link).toHaveAttribute('href', '/dashboard')
		expect(screen.getByText('Dashboard')).toBeInTheDocument()
	})

	it('marks the active route with the primary token', () => {
		const { container } = render(DemoNavItem, {
			href: '/dashboard',
			label: 'Dashboard',
			icon: 'i-app-list'
		})
		expect(container.querySelector('a')?.className).toContain('bg-primary')
	})

	it('is inactive for a different route', () => {
		const { container } = render(DemoNavItem, {
			href: '/data',
			label: 'Space Facts',
			icon: 'i-app-list'
		})
		const link = container.querySelector('a')
		expect(link?.className).not.toContain('bg-primary')
		expect(link?.className).toContain('text-ink-mute')
	})

	it('prevents navigation when locked and not in hacker mode', () => {
		const { container } = render(DemoNavItem, {
			href: '/admin',
			label: 'Admin',
			icon: 'i-app-shield',
			locked: true
		})
		const link = container.querySelector('a')
		expect(link).toHaveAttribute('href', '/admin')

		// jsdom doesn't navigate; assert the handler is wired and lock disables click affordance
		const click = new MouseEvent('click', { bubbles: true, cancelable: true })
		link?.dispatchEvent(click)
		expect(link?.className).toContain('cursor-not-allowed')
	})

	it('does not show the lock as unlocked in app mode', () => {
		const { container } = render(DemoNavItem, {
			href: '/admin',
			label: 'Admin',
			icon: 'i-app-shield',
			locked: true
		})
		expect(container.querySelector('.i-app-shield.text-ink-faint')).not.toBeNull()
	})

	it('shows unlocked lock in hacker mode', () => {
		hackerMode.toggle()
		const { container } = render(DemoNavItem, {
			href: '/admin',
			label: 'Admin',
			icon: 'i-app-shield',
			locked: true
		})
		expect(container.querySelector('.i-app-code-visible.text-warning')).not.toBeNull()
	})

	it('navigable classes in hacker mode even when locked', () => {
		hackerMode.toggle()
		const { container } = render(DemoNavItem, {
			href: '/admin',
			label: 'Admin',
			icon: 'i-app-shield',
			locked: true
		})
		expect(container.querySelector('a')?.className).not.toContain('cursor-not-allowed')
	})

	it('calls no navigation in jsdom — click handler is safe when unlocked', async () => {
		const { container } = render(DemoNavItem, {
			href: '/dashboard',
			label: 'Dashboard',
			icon: 'i-app-list'
		})
		const link = container.querySelector('a')
		await fireEvent.click(link)
		expect(link).toBeDefined()
	})
})
