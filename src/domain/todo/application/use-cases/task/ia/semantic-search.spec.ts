import { SemanticSearchEmbeddingUseCase } from './semantic-search'
import { TaskPriority, TaskStatus, Task } from '@/domain/todo/enterprise/entities/task'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { vi } from 'vitest'
import { InMemoryTaskRepository } from 'test/repositories/in-memory-task-repository'
import { Slug } from '@/domain/todo/enterprise/entities/value-objects/slug'
import { AICacheService } from '@/infra/cache/ai-cache.service'
import { InMemoryCacheRepository } from 'test/repositories/in-memory-cache-repository'

class OpenAiServiceMock {
  createEmbedding = vi.fn()
}

let inMemoryTaskRepository: InMemoryTaskRepository
let openai: OpenAiServiceMock
let sut: SemanticSearchEmbeddingUseCase
let aiCacheService: AICacheService
let cacheRepository: InMemoryCacheRepository

describe('SemanticSearchEmbeddingUseCase', () => {
  beforeEach(() => {
    inMemoryTaskRepository = new InMemoryTaskRepository()
    openai = new OpenAiServiceMock()
    cacheRepository = new InMemoryCacheRepository()
    aiCacheService = new AICacheService(cacheRepository)
    sut = new SemanticSearchEmbeddingUseCase(
      inMemoryTaskRepository,
      openai as any,
      aiCacheService,
    )
    aiCacheService.setCachedResponse('embedding:foo', JSON.stringify([0.1, 0.2, 0.3]), 7200)
  })

  it('should return tasks ordered by similarity', async () => {
    openai.createEmbedding.mockResolvedValueOnce(aiCacheService.getCachedResponse('embedding:foo'))

    const t1 = Task.create(
      {
        title: 'Task 1',
        description: 'Desc 1',
        slug: Slug.createFromText('task-1'),
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        authorId: new UniqueEntityID(),
      },
      new UniqueEntityID('t1'),
    )

    const t2 = Task.create(
      {
        title: 'Task 2',
        description: 'Desc 2',
        slug: Slug.createFromText('task-2'),
        priority: TaskPriority.HIGH,
        status: TaskStatus.COMPLETED,
        authorId: new UniqueEntityID(),
      },
      new UniqueEntityID('t2'),
    )

    inMemoryTaskRepository.items.push(t1, t2)

    const result = await sut.execute({ title: 'foo', description: 'bar' })

    expect(result.isRight()).toBe(true)

    const tasks = result.value?.tasks
    expect(Array.isArray(tasks)).toBe(true)
    expect(tasks).toHaveLength(2)
    expect(tasks?.[0].title).toBe('Task 1')
    expect(tasks?.[0].slug.value).toBe('task-1')
    expect(tasks?.[1].priority).toBe(TaskPriority.HIGH)

    expect(openai.createEmbedding).toHaveBeenCalledTimes(0)
    expect(aiCacheService.getCachedResponse).toHaveBeenCalledTimes(1)
    expect(aiCacheService.getCachedResponse).toHaveBeenCalledWith('embedding:foo')
  })
})

