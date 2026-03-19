<script lang="ts">
	interface Props {
		type?: 'tip' | 'note' | 'warning' | 'danger'
		title?: string
		children: import('svelte').Snippet
	}
	let { type = 'note', title, children }: Props = $props()

	const styles = {
		tip: {
			bar: 'bg-emerald-500',
			bg: 'bg-emerald-500/10',
			text: 'text-emerald-400',
			icon: 'i-app-shield',
			label: 'Tip'
		},
		note: {
			bar: 'bg-blue-500',
			bg: 'bg-blue-500/10',
			text: 'text-blue-400',
			icon: 'i-app-list',
			label: 'Note'
		},
		warning: {
			bar: 'bg-amber-500',
			bg: 'bg-amber-500/10',
			text: 'text-amber-400',
			icon: 'i-app-code-visible',
			label: 'Warning'
		},
		danger: {
			bar: 'bg-red-500',
			bg: 'bg-red-500/10',
			text: 'text-red-400',
			icon: 'i-app-shield',
			label: 'Danger'
		}
	}
	const s = $derived(styles[type])
</script>

<div class="flex overflow-hidden rounded-lg {s.bg} my-4">
	<div class="w-1 shrink-0 {s.bar}"></div>
	<div class="px-4 py-3 text-sm">
		<p class="mb-1 flex items-center gap-1.5 font-semibold {s.text}">
			<span class="{s.icon} h-4 w-4"></span>
			{title ?? s.label}
		</p>
		<div class="text-surface-z7">
			{@render children()}
		</div>
	</div>
</div>
