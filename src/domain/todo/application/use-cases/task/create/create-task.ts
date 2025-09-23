import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { TasksRepository } from '../../../repositories/task-repository'
import { Task, TaskPriority, TaskStatus } from '@/domain/todo/enterprise/entities/task'

interface CreateTaskUseCaseRequest {
  authorId: string
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
}

type CreateTaskUseCaseResponse = Either<
  null,
  {
    task: Task
  }
>

@Injectable()
export class CreateTaskUseCase {
  constructor(private tasksRepository: TasksRepository) { }

  async execute({
    authorId,
    title,
    description,
    priority,
    status,
  }: CreateTaskUseCaseRequest): Promise<CreateTaskUseCaseResponse> {
    const task = Task.create({
      authorId: new UniqueEntityID(authorId),
      title,
      description,
      priority,
      status,
    })

    await this.tasksRepository.create(task)

    return right({
      task,
    })
  }
}
