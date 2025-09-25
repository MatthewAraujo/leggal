import { UseCaseError } from '@/core/errors/use-case-error'

export class OpenAiNoResponseError extends Error implements UseCaseError {
	constructor() {
		super('No response from OpenAI')
	}
}
