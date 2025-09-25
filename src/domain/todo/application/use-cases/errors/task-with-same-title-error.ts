import { UseCaseError } from '@/core/errors/use-case-error'

export class TaskWithSameTitleError extends Error implements UseCaseError {
	constructor(identifier: string) {
		super(`task "${identifier}" already exists.`)
	}
}
