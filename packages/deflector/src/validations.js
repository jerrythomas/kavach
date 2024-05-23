import { fillMissingProps } from './utils'

/**
 * Validates that the path does not have empty sections
 *
 * @param {import('./types').RoutingRule} rule
 * @returns {import('./types').RoutingRule}
 */
export function validateNonEmptyParts(rule) {
	if (rule.path === '/') return rule

	const somePartsEmpty = rule.path
		.split('/')
		.slice(1)
		.some((section) => !section.trim())

	if (somePartsEmpty)
		rule.errors = [...(rule.errors ?? []), 'Path sections must not be empty']
	return rule
}

/**
 * Validates that the path starts with a slash
 *
 * @param {import('./types').RoutingRule} rule
 * @returns {import('./types').RoutingRule}
 */
export function validatePathStartsWithSlash(rule) {
	if (!rule.path.startsWith('/'))
		rule.errors = [...(rule.errors ?? []), 'Path must start with /']
	return rule
}

/**
 * Validates that the path is a non-empty string
 *
 * @param {import('./types').RoutingRule} rule
 * @returns {import('./types').RoutingRule}
 */
export function validatePath(rule) {
	if (typeof rule.path !== 'string' || rule.path.trim().length === 0) {
		rule.errors = ['Path must be a non-empty string']
	}
	return rule
}

/**
 * Validate a routing rule
 *
 * @param {import('./types').RoutingRule} rule
 * @returns {import('./types').RuleValidationIssue}
 */
export function validateRoutingRule(rule) {
	rule = validatePath(rule)
	if (typeof rule.path === 'string') {
		rule = validateNonEmptyParts(rule)
		rule = validatePathStartsWithSlash(rule)
	}
	return rule
}

/**
 * A redundant rule has a path that is included in another rule and has the same public value or roles.
 * This function identifies redundant rules and marks them as such.
 *
 * @param {import('./types').RoutingRules} rules
 * @returns {import('./types').RoutingRules} The rules with redundant rules identified
 */
export function validateRedundantRules(rules) {
	const maxDepth = Math.max(...rules.map(({ depth }) => depth))

	for (let i = maxDepth; i > 0; i--) {
		const children = rules.filter((rule) => rule.depth === i)
		const parents = rules.filter((rule) => rule.depth < i)

		children.forEach((rule) => {
			markRedundant(rule, parents)
		})
	}

	return rules
}

/**
 * Marks a rule as redundant if it is included in another rule and has the same public value or roles.
 *
 * @param {import('./types').RoutingRule} rule
 * @param {import('./types').RoutingRules} rules
 * @returns {import('./types').RoutingRule}
 */
export function markRedundant(rule, rules) {
	const parentRule = rules.find((r) => rule.path.startsWith(`${r.path}/`))
	if (
		parentRule &&
		rule.public === parentRule.public &&
		rule.roles === parentRule.roles
	) {
		rule.redundant = true
		rule.warnings = [
			...(rule.warnings ?? []),
			`Redundant rule: ${parentRule.path} includes ${rule.path}`
		]
	}
	return rule
}

/**
 * Validate multiple rules
 *
 * @param {import('./types').RoutingRules} rules
 * @returns {import('./types').RoutingRules}
 */
export function validateRoutingRules(rules) {
	rules = rules.map(fillMissingProps).map(validateRoutingRule)
	rules = validateRedundantRules(rules)
	return rules
}
