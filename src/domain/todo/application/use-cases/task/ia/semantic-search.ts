import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { OpenAiService } from '@/infra/services/openai/openai.service'
import { Task, TaskPriority } from '@/domain/todo/enterprise/entities/task'
import { Either, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Slug } from '@/domain/todo/enterprise/entities/value-objects/slug'
import { TasksRepository } from '../../../repositories/task-repository'

interface SemanticSearchTaskUseCaseRequest {
  title: string
  description: string
}

type SemanticSearchTaskUseCaseResponse = Either<
  null,
  { tasks: Task[] }
>


@Injectable()
export class SemanticSearchEmbeddingUseCase {
  constructor(
    private tasksRepository: TasksRepository,
    private openaiService: OpenAiService,
  ) { }

  async execute({ title, description }: SemanticSearchTaskUseCaseRequest): Promise<SemanticSearchTaskUseCaseResponse> {
    const embedding = await this.openaiService.createEmbedding(`${title} ${description}`)


    const task = await this.tasksRepository.findSimilarTasks(embedding)


    return right({ tasks: task })
  }
}

