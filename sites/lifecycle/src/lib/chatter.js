import levenshtein from 'js-levenshtein'
import { writable } from 'svelte/store'
import { pick } from 'ramda'

/**
 * @typedef Interaction
 * @property {string} question
 * @property {string} prompt
 * @property {Array<string>} answers
 * @property {Array<string>} customAnswers
 */

export function chatWithUser(adapter, options, data) {
	const allowed = [...data.answers, ...data.customAnswers].map((answer) =>
		answer.toLowerCase()
	)
	const prompt = data.prompt ?? 'Try again'
	const props = {
		allowed,
		prompt,
		...pick(['name', 'threshold', 'maxAttempts'], options)
	}
	let attemptNumber = 1
	let attempts = writable([])

	const handleResponse = (
		/** @type {string} */ transcript,
		/** @type {number} */ confidence
	) => {
		console.log('received: ' + transcript, confidence)
		let attempt = validateAttempt(adapter, props, {
			transcript,
			confidence,
			attempt: attemptNumber
		})
		if (attempt.status === 'incorrect') {
			attemptNumber++
		}
		attempts.update((items) => [...items, attempt])
		console.log(attempt)
	}

	const start = () => {
		adapter.listen(handleResponse)
		adapter.speak(data.question)
		adapter.startListening()
	}

	return { attempts, start }
}

function validateAttempt(adapter, props, attempt) {
	attempt = {
		...attempt,
		...findMatchingAnswer(attempt.transcript, props.allowed)
	}

	if (attempt.type !== 'none' && attempt.confidence >= props.threshold) {
		attempt.status = 'correct'
		adapter.speak('Good job!, ' + props.name)
		adapter.stopListening()
	} else if (attempt.confidence < props.threshold) {
		attempt.status = 'unknown'
		adapter.speak('I did not hear that. Please try again, ' + props.name)
	} else {
		attempt.status = 'incorrect'
		if (attempt.attempt == props.maxAttempts) {
			adapter.stopListening()
		}
		adapter.speak(props.prompt + ', ' + props.name)
	}
	return attempt
}
/**
 * Remove consecutive duplicate words from a string
 *
 * @param {string} text
 * @returns
 */
function removeConsecutiveDuplicates(text) {
	return text
		.split(/\s+/)
		.filter((value, index, arr) => value != arr[index + 1])
		.join(' ')
}

/**
 * Attempts to match a string with an array of strings
 *
 * @param {string} text
 * @param {Array<string>} allowed
 * @returns
 */
export function findMatchingAnswer(text, allowed) {
	console.log(text)
	const response = removeConsecutiveDuplicates(text)

	let matches = allowed.filter((answer) => answer === response)
	if (matches.length > 0) {
		return { type: 'exact', matches }
	}

	matches = allowed.filter(
		(answer) => answer.match(response) || response.match(answer)
	)
	if (matches.length > 0) {
		return { type: 'partial', matches }
	}

	matches = allowed.filter((answer) => levenshtein(answer, response) <= 1)
	if (matches.length > 0) {
		return { type: 'levenshtein', matches }
	}

	return { type: 'none', matches }
}
