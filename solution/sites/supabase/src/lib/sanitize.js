/**
 * Replaces newlines in quoted strings with <br/> tags.
 * Ignores escaped quotes.
 *
 * @param {string} input
 * @returns {string}
 */
export function replaceNewlinesInQuotes(input) {
	// return input.replaceAll('\n', '\\n')
	// This regex pattern uses a negative lookbehind to ignore escaped quotes.
	const regex = /"((?:[^"\\]|\\.)*)"/g

	return input.replace(regex, (_, group) => {
		return `"${group.replace(/\n/g, '<br/>')}"`
	})
}

/**
 * Reverts <br/> tags to newlines in JSON.
 *
 * @param {*} data
 * @returns
 */
export function revertNewlinesInJSON(data) {
	Object.keys(data).forEach((key) => {
		if (typeof data[key] === 'string') {
			data[key] = data[key].replaceAll('<br/>', '\n')
		} else if (typeof data[key] === 'object') {
			data[key] = revertNewlinesInJSON(data[key])
		}
	})
	return data
}

/**
 * Handles newlines in quoted strings so that it can be converted to JSON.
 *
 * @param {string} input
 * @returns {object}
 */
export function sanitizedJson(input) {
	const data = JSON.parse(replaceNewlinesInQuotes(input))
	return revertNewlinesInJSON(data)
}
