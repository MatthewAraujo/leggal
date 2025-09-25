import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { TasksRepository } from '../../../repositories/task-repository'
import { OpenAiService } from '@/infra/services/openai/openai.service'
import { Task, TaskPriority, TaskStatus } from '@/domain/todo/enterprise/entities/task'
import { Slug } from '@/domain/todo/enterprise/entities/value-objects/slug'
import { TaskWithSameTitleError } from '../../errors/task-with-same-title-error'

interface CreateTaskUseCaseRequest {
  authorId: string
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
}

type CreateTaskUseCaseResponse = Either<
  TaskWithSameTitleError,
  {
    task: Task
  }
>

@Injectable()
export class CreateTaskUseCase {
  constructor(
    private tasksRepository: TasksRepository,
    private readonly openAiService: OpenAiService,
  ) { }

  async execute({
    authorId,
    title,
    description,
    priority,
    status,
  }: CreateTaskUseCaseRequest): Promise<CreateTaskUseCaseResponse> {

    const taskWithSameTitle = await this.tasksRepository.findByTitle(title)
    if (taskWithSameTitle) {
      return left(new TaskWithSameTitleError(title))
    }

    const task = Task.create({
      authorId: new UniqueEntityID(authorId),
      title,
      description,
      priority,
      status,
    })

    await this.tasksRepository.create(task)

    const textForEmbedding = `${title}\n\n${description}`
    const embedding = await this.openAiService.createEmbedding(textForEmbedding)
    await this.tasksRepository.updateEmbedding(task.id.toString(), embedding)

    return right({
      task,
    })
  }
}
