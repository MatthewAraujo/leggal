import { Injectable } from '@nestjs/common'
import { Either, left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { TasksRepository } from '../../../repositories/task-repository'
import { UsersRepository } from '../../../repositories/users-repository'
import { Task } from '@/domain/todo/enterprise/entities/task'

interface GetTasksUseCaseRequest {
  authorId: string
}

type GetTasksUseCaseResponse = Either<
  { message: string },
  { tasks: Task[] }
>

@Injectable()
export class GetTasksUseCase {
  constructor(
    private tasksRepository: TasksRepository,
    private usersRepository: UsersRepository,
  ) { }

  async execute({ authorId }: GetTasksUseCaseRequest): Promise<GetTasksUseCaseResponse> {
    const userId = new UniqueEntityID(authorId)

    const user = await this.usersRepository.findById(userId.toString())
    if (!user) {
      return left({ message: 'Usuário não encontrado.' })
    }

    const tasks = await this.tasksRepository.findAllByAuthorId(userId.toString())

    if (!tasks || tasks.length === 0) {
      return left({ message: 'Não há tasks para este usuário.' })
    }

    return right({ tasks })
  }
}

