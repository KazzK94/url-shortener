
export class ForbiddenAccessError extends Error {
	status: number

	constructor(message: string) {
		super(message)
		this.name = 'ForbiddenAccessError'
		this.message = message
		this.status = 403
	}
}
