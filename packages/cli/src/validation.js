export function validateConfig(config, capabilities) {
	const warnings = []
	const errors = []

	if (!capabilities) {
		errors.push(`Unknown adapter: ${config.adapter}`)
		return { warnings, errors }
	}

	// Check unsupported features
	if (config.dataRoute && !capabilities.supports.data) {
		warnings.push(`Data route configured but not supported by ${capabilities.displayName}`)
	}

	if (config.rpcRoute && !capabilities.supports.rpc) {
		warnings.push(`RPC route configured but not supported by ${capabilities.displayName}`)
	}

	if (config.logging && !capabilities.supports.logging) {
		warnings.push(`Logging configured but not supported by ${capabilities.displayName}`)
	}

	// Check unsupported providers
	const configuredProviders = config.providers || []
	for (const provider of configuredProviders) {
		const name = provider.name || provider
		if (name === 'magic' && !capabilities.supports.magic) {
			warnings.push(`Provider "magic link" not supported by ${capabilities.displayName}`)
		}
		if (name === 'email' && !capabilities.supports.password) {
			warnings.push(`Provider "password" not supported by ${capabilities.displayName}`)
		}
	}

	return { warnings, errors }
}

export function formatValidationOutput(validation) {
	const lines = []

	if (validation.errors.length > 0) {
		lines.push('[ERRORS]')
		validation.errors.forEach((e) => lines.push(`  - ${e}`))
	}

	if (validation.warnings.length > 0) {
		lines.push('[WARNINGS]')
		validation.warnings.forEach((w) => lines.push(`  - ${w}`))
	}

	if (validation.errors.length === 0 && validation.warnings.length === 0) {
		lines.push(`[OK] All configured features are supported`)
	}

	return lines.join('\n')
}
