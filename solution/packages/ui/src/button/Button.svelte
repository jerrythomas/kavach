<script>
	// import type { ButtonRootProps } from './types'

	let { ref = $bindable(null), href, type, children, disabled = false, ...restProps } = $props()
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	data-button-root
	type={href ? undefined : type}
	href={href && !disabled ? href : undefined}
	disabled={href ? undefined : disabled}
	aria-disabled={href ? disabled : undefined}
	role={href && disabled ? 'link' : undefined}
	tabindex={href && disabled ? -1 : 0}
	bind:this={ref}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
