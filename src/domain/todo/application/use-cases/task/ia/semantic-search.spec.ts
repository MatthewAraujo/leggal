import { SemanticSearchEmbeddingUseCase } from './semantic-search'
import { TaskPriority, TaskStatus, Task } from '@/domain/todo/enterprise/entities/task'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { vi } from 'vitest'
import { InMemoryTaskRepository } from 'test/repositories/in-memory-task-repository'
import { Slug } from '@/domain/todo/enterprise/entities/value-objects/slug'

class OpenAiServiceMock {
  createEmbedding = vi.fn()
}

let inMemoryTaskRepository: InMemoryTaskRepository
let openai: OpenAiServiceMock
let sut: SemanticSearchEmbeddingUseCase

describe('SemanticSearchEmbeddingUseCase', () => {
  beforeEach(() => {
    inMemoryTaskRepository = new InMemoryTaskRepository()
    openai = new OpenAiServiceMock()
    sut = new SemanticSearchEmbeddingUseCase(
      inMemoryTaskRepository,
      openai as any,
    )
  })

  it('should return tasks ordered by similarity', async () => {
    // Mock embedding
    openai.createEmbedding.mockResolvedValueOnce([0.1, 0.2, 0.3])

    // cria tasks no repositório de memória
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

    expect(openai.createEmbedding).toHaveBeenCalledTimes(1)
  })
})

