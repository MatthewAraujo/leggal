import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { OpenAiService } from '@/infra/services/openai/openai.service'
import { Task, TaskPriority } from '@/domain/todo/enterprise/entities/task'
import { Either, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Slug } from '@/domain/todo/enterprise/entities/value-objects/slug'

interface SemanticSearchTaskUseCaseRequest {
  title: string
  description: string
}

type SemanticSearchTaskUseCaseResponse = Either<
  null,
  { tasks: Task[] }
>

interface SimilarTaskRaw {
  id: string
  title: string
  slug: string
  description: string
  priority: TaskPriority
  status: string
  authorId: string
}

@Injectable()
export class SemanticSearchEmbeddingUseCase {
  constructor(
    private prisma: PrismaService,
    private openaiService: OpenAiService,
  ) { }

  async execute({ title, description }: SemanticSearchTaskUseCaseRequest): Promise<SemanticSearchTaskUseCaseResponse> {
    const embedding = await this.openaiService.createEmbedding(`${title} ${description}`)

    const similarTasksRaw = await this.prisma.$queryRaw<SimilarTaskRaw[]>`
      SELECT *
      FROM tasks
      ORDER BY embedding <-> ${embedding} ASC
      LIMIT 5
    `

    const tasks: Task[] = similarTasksRaw.map(t => Task.create({
      title: t.title,
      description: t.description,
      slug: Slug.create(t.slug),
      priority: t.priority,
      status: t.status as any,
      authorId: new UniqueEntityID(t.authorId)
    }))

    return right({ tasks })
  }
}

