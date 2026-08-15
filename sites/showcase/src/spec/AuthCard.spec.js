import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/svelte'
import AuthCard from '../lib/components/AuthCard.svelte'

const mockKavach = {
	signIn: vi.fn().mockResolvedValue({ data: { user: { email: 'test@test.com' } } })
}

/** @param {import('svelte').ComponentProps<typeof AuthCard>} props */
function renderWithContext(props) {
	return render(AuthCard, {
		props,
		context: new Map([['kavach', mockKavach]])
	})
}

describe('AuthCard', () => {
	it('renders the adapter label in the subtitle', () => {
		renderWithContext({ adapterId: 'supabase', onSuccess: () => {} })
		expect(screen.getByText(/Supabase · Kavach Demo/)).toBeInTheDocument()
	})

	it('renders a provider button per adapter provider', () => {
		renderWithContext({ adapterId: 'supabase', onSuccess: () => {} })
		expect(screen.getByText('Continue with Google')).toBeInTheDocument()
		expect(screen.getByText('Email Magic Link')).toBeInTheDocument()
	})

	it('renders the role preview buttons', () => {
		renderWithContext({ adapterId: 'supabase', onSuccess: () => {} })
		expect(screen.getByText('user')).toBeInTheDocument()
		expect(screen.getByText('admin')).toBeInTheDocument()
	})

	it('defaults preview to user', () => {
		renderWithContext({ adapterId: 'supabase', onSuccess: () => {} })
		expect(screen.getByText(/User can open \/dashboard and \/data/)).toBeInTheDocument()
	})

	it('switches preview text when admin is selected', async () => {
		renderWithContext({ adapterId: 'supabase', onSuccess: () => {} })
		await fireEvent.click(screen.getByText('admin'))
		expect(screen.getByText(/Admin can open \/admin/)).toBeInTheDocument()
	})

	it('does not render the adapter picker by default', () => {
		renderWithContext({ adapterId: 'supabase', onSuccess: () => {} })
		expect(screen.queryByText('Adapter')).not.toBeInTheDocument()
	})

	it('renders the adapter picker when showPicker is true', () => {
		renderWithContext({ adapterId: 'supabase', onSuccess: () => {}, showPicker: true })
		expect(screen.getByText('Adapter')).toBeInTheDocument()
		expect(screen.getByText('Firebase')).toBeInTheDocument()
	})

	it('fires onPickAdapter when an adapter chip is clicked', async () => {
		const onPickAdapter = vi.fn()
		renderWithContext({
			adapterId: 'supabase',
			onSuccess: () => {},
			showPicker: true,
			onPickAdapter
		})
		await fireEvent.click(screen.getByText('Convex'))
		expect(onPickAdapter).toHaveBeenCalledWith('convex')
	})

	it('renders no providers for an adapter without provider config', () => {
		renderWithContext({ adapterId: 'amplify', onSuccess: () => {} })
		expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument()
	})
})
