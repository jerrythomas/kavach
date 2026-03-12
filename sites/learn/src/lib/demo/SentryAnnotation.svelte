<script lang="ts">
	let {
		title,
		body,
		rule
	}: {
		title: string
		body: string
		rule?: string
	} = $props()
</script>

<div
	class="border-primary bg-primary/5 flex flex-col gap-1 rounded-xl border-l-4 p-4"
	role="note"
	aria-label="Kavach Sentry explanation"
>
	<div class="flex items-center gap-2">
		<span class="i-app:shield text-primary h-4 w-4 shrink-0" aria-hidden="true"></span>
		<span class="text-primary text-xs font-semibold uppercase tracking-wider">Sentry</span>
		{#if rule}
			<code class="bg-primary/10 text-primary rounded px-1.5 py-0.5 font-mono text-xs">{rule}</code>
		{/if}
	</div>
	<p class="text-surface-z8 text-sm font-medium">{title}</p>
	<p class="text-surface-z6 text-xs leading-relaxed">{body}</p>
</div>
