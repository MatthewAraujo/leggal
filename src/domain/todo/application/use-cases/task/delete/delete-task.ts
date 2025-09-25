import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { TasksRepository } from '../../../repositories/task-repository'

interface DeleteTaskUseCaseRequest {
	authorId: string
	taskId: string
}

type DeleteTaskUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, null>

@Injectable()
export class DeleteTaskUseCase {
	constructor(private tasksRepository: TasksRepository) {}

	async execute({
		taskId,
		authorId,
	}: DeleteTaskUseCaseRequest): Promise<DeleteTaskUseCaseResponse> {
		const task = await this.tasksRepository.findById(taskId)

		if (!task) {
			return left(new ResourceNotFoundError())
		}

		if (authorId !== task.authorId.toString()) {
			return left(new NotAllowedError())
		}

		await this.tasksRepository.delete(task)

		return right(null)
	}
}
