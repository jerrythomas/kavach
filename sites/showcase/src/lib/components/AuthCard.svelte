<script>
	import { AuthProvider } from '@kavach/ui'
	import { ADAPTERS, ADAPTER_PROVIDERS, COPY } from '../config/demo-config'

	let { adapterId, onSuccess, showPicker = false, onPickAdapter = () => {} } = $props()

	const adapterLabel = $derived(ADAPTERS[adapterId]?.label ?? adapterId)
	const providers = $derived(ADAPTER_PROVIDERS[adapterId] ?? [])

	let rolePreview = $state('user')
	const roles = ['user', 'admin']
</script>

<div class="bg-paper-soft border-paper-edge flex flex-col gap-4 rounded-2xl border p-6">
	<div class="flex flex-col gap-1">
		<h2 class="text-ink text-xl font-black">{COPY.signIn.title}</h2>
		<p class="text-ink-soft text-sm">{COPY.signIn.subtitle.replace('{adapter}', adapterLabel)}</p>
	</div>

	{#each providers as p (p.name)}
		<AuthProvider name={p.name} mode={p.mode ?? 'oauth'} onsuccess={onSuccess} label={p.label} />
	{/each}

	{#if showPicker}
		<div class="border-paper-edge mt-2 flex flex-col gap-2 border-t pt-4">
			<span class="text-ink-soft text-xs font-semibold tracking-wider uppercase">Adapter</span>
			<div class="flex flex-wrap gap-2">
				{#each Object.entries(ADAPTERS) as [id, adapter] (id)}
					<button
						type="button"
						onclick={() => onPickAdapter(id)}
						class="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors
              {id === adapterId
							? 'border-primary bg-primary text-on-primary'
							: 'border-paper-edge bg-paper text-ink-mute hover:border-primary'}"
					>
						{adapter.label}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<div class="flex flex-col gap-2">
		<span class="text-ink-soft text-xs font-semibold tracking-wider uppercase">Preview role</span>
		<div class="flex gap-2">
			{#each roles as role (role)}
				<button
					type="button"
					onclick={() => (rolePreview = role)}
					class="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors
            {rolePreview === role
						? 'bg-primary text-on-primary'
						: 'bg-paper-mute text-ink-mute hover:bg-paper-edge'}"
				>
					{role}
				</button>
			{/each}
		</div>
		<p class="text-ink-faint text-xs">
			{rolePreview === 'admin' ? 'Admin can open /admin' : 'User can open /dashboard and /data'}
		</p>
	</div>
</div>
