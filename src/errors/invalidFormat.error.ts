
export class InvalidFormatError extends Error {
	status: number

	constructor(message: string, status: number = 400) {
		super(message)
		this.name = 'InvalidFormatError'
		this.status = status ?? 400
		this.message = message
	}
}
