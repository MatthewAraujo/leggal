import { Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Task } from '@/domain/todo/enterprise/entities/task'
import { Injectable } from '@nestjs/common'
import { TasksRepository } from '../../../repositories/task-repository'
import { UsersRepository } from '../../../repositories/users-repository'
import { UserNotFoundError } from '../../errors/user-not-found-error'

interface fetchTasksUseCaseRequest {
	authorId: string
	page: number
}

type fetchTasksUseCaseResponse = Either<UserNotFoundError | null, { tasks: Task[] }>

@Injectable()
export class FetchTasksUseCase {
	constructor(
		private tasksRepository: TasksRepository,
		private usersRepository: UsersRepository,
	) {}

	async execute({ authorId, page }: fetchTasksUseCaseRequest): Promise<fetchTasksUseCaseResponse> {
		const userId = new UniqueEntityID(authorId)

		const user = await this.usersRepository.findById(userId.toString())
		if (!user) {
			return left(new UserNotFoundError())
		}

		const tasks = await this.tasksRepository.findAllByAuthorId(userId.toString(), { page })

		if (!tasks) return right({ tasks: [] })

		return right({ tasks })
	}
}
