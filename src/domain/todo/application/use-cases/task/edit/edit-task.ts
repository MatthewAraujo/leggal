import { Either, left, right } from '@/core/either'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Injectable } from '@nestjs/common'
import { TaskPriority, TaskStatus } from '@/domain/todo/enterprise/entities/task'
import { Task } from '@/domain/todo/enterprise/entities/task'
import { TasksRepository } from '../../../repositories/users-repository'

interface EditTaskUseCaseRequest {
  authorId: string
  taskId: string
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
}

type EditTaskUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    task: Task
  }
>

@Injectable()
export class EditTaskUseCase {
  constructor(
    private tasksRepository: TasksRepository,
  ) { }

  async execute({
    authorId,
    taskId,
    title,
    description,
    priority,
    status,
  }: EditTaskUseCaseRequest): Promise<EditTaskUseCaseResponse> {
    const task = await this.tasksRepository.findById(taskId)

    if (!task) {
      return left(new ResourceNotFoundError())
    }

    if (authorId !== task.authorId.toString()) {
      return left(new NotAllowedError())
    }

    task.title = title
    task.description = description
    task.priority = priority
    task.status = status

    await this.tasksRepository.save(task)

    return right({
      task,
    })
  }
}
