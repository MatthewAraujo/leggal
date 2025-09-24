import { SemanticSearchEmbeddingUseCase } from './semantic-search'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { TaskPriority } from '@/domain/todo/enterprise/entities/task'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

class OpenAiServiceMock {
  createEmbedding = vi.fn()
}

class PrismaServiceMock {
  $queryRaw = vi.fn()
}

describe('SemanticSearchEmbeddingUseCase', () => {
  let prisma: PrismaServiceMock
  let openai: OpenAiServiceMock
  let sut: SemanticSearchEmbeddingUseCase

  beforeEach(() => {
    prisma = new PrismaServiceMock()
    openai = new OpenAiServiceMock()
    sut = new SemanticSearchEmbeddingUseCase(prisma as unknown as PrismaService, openai as any)
  })

  it('should return mapped tasks from database rows ordered by similarity', async () => {
    (openai.createEmbedding as any).mockResolvedValueOnce([0.1, 0.2, 0.3])

    const rows = [
      {
        id: 't1',
        title: 'Task 1',
        slug: 'task-1',
        description: 'Desc 1',
        priority: TaskPriority.MEDIUM,
        status: 'PENDING',
        authorId: new UniqueEntityID().toString(),
      },
      {
        id: 't2',
        title: 'Task 2',
        slug: 'task-2',
        description: 'Desc 2',
        priority: TaskPriority.HIGH,
        status: 'COMPLETED',
        authorId: new UniqueEntityID().toString(),
      },
    ]

      ; (prisma.$queryRaw as any).mockResolvedValueOnce(rows)

    const result = await sut.execute({ title: 'foo', description: 'bar' })

    expect(result.isRight()).toBe(true)
    if (result.isLeft()) throw new Error('Expected right')
    const tasks = (result.value as { tasks: any[] }).tasks
    expect(Array.isArray(tasks)).toBe(true)
    expect(tasks).toHaveLength(2)
    expect(tasks[0].title).toBe('Task 1')
    expect(tasks[0].slug.value).toBe('task-1')
    expect(tasks[1].priority).toBe(TaskPriority.HIGH)
  })
})


