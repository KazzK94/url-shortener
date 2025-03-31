
const SHORT_KEY_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function generateShortKey(length: number): string {
	let result = ''
	for (let i = 0; i < length; i++) {
		result += SHORT_KEY_CHARACTERS.charAt(Math.floor(Math.random() * SHORT_KEY_CHARACTERS.length))
	}
	return result
}
