const defaultTTSOptions = { lang: 'hi-IN', rate: 0.8 }

/**
 *
 * @param {*} options
 * @returns
 */
export function createAdapter(options = {}) {
	let speaker = getSpeaker(options.speaker)
	let listener = getListener(options.listener)
	let stopped = true
	let paused = false
	let handlersAdded = false

	const speak = (/** @type {string} */ text) => {
		speaker.text = text
		speechSynthesis.speak(speaker)
	}

	const listen = (callback) => {
		listener.onresult = (event) => {
			const { transcript, confidence } = event.results[0][0]
			callback(transcript, confidence)
		}
		listener.onend = () => {
			if (options.continuous && !stopped && !paused) {
				listener.start()
			}
		}
	}

	const startListening = () => {
		stopped = false
		paused = false
		addConflictHandlers()
		if (!speechSynthesis.speaking) listener.start()
	}

	const pauseListening = () => {
		paused = true
		listener.stop()
	}

	const resumeListening = () => {
		if (!stopped && paused) {
			startListening()
		}
	}

	const stopListening = () => {
		stopped = true
		removeConflictHandlers()
		listener.stop()
	}

	const addConflictHandlers = () => {
		if (!handlersAdded) {
			speaker.addEventListener('start', () => pauseListening())
			speaker.addEventListener('end', () => resumeListening())
			handlersAdded = true
		}
	}
	const removeConflictHandlers = () => {
		if (handlersAdded) {
			speaker.removeEventListener('start', () => pauseListening())
			speaker.removeEventListener('end', () => resumeListening())
			handlersAdded = false
		}
	}

	return {
		speak,
		listen,
		startListening,
		stopListening
	}
}

/**
 *
 * @param {*} options
 * @returns
 */
export function getSpeaker(options = defaultTTSOptions) {
	let { lang, rate } = options
	let msg = new SpeechSynthesisUtterance()
	let voices = speechSynthesis.getVoices().filter((x) => x.lang === lang)

	if (voices.length > 0) {
		msg.voice = voices[0]
	}
	msg.rate = rate
	msg.lang = lang
	return msg
}

/**
 *
 * @param {*} options
 * @returns
 */
export function getListener(options) {
	const SpeechRecognition =
		window.SpeechRecognition || window.webkitSpeechRecognition

	const recognition = new SpeechRecognition()
	recognition.continuous = false
	recognition.lang = options?.lang || 'en-UK'
	recognition.interimResults = false
	recognition.maxAlternatives = 3

	return recognition
}
