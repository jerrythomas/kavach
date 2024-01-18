<script>
import { theme } from '@rokkit/stores'
import { defaultStateIcons } from '@rokkit/core'
import { Icon } from '@rokkit/atoms'

function toggleMode() {
		const mode = $theme.mode === 'dark' ? 'light' : 'dark'
		theme.set({ ...$theme, mode })
	}

</script>
<theme-mode role="switch" aria-checked={$theme.mode === 'dark'} class="flex p-0">
	<Icon
		name={defaultStateIcons.mode[$theme.mode]}
		role="button"
		on:click={toggleMode}
		class="border border-neutral-muted rounded"
	/>
</theme-mode>