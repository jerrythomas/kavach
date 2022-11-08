export function logged_data(level, date, detail) {
	return {
		level,
		running_on,
		logged_at: date.toISOString(),
		detail
	}
}
