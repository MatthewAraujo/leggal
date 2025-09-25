import { InMemoryTaskRepository } from 'test/repositories/in-memory-task-repository'
import { CreateTaskUseCase } from './create-task'
import { TaskPriority, TaskStatus } from '@/domain/todo/enterprise/entities/task'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { vi } from 'vitest'

let inMemoryTaskRepository: InMemoryTaskRepository
let sut: CreateTaskUseCase
let openAiServiceMock: { createEmbedding: (text: string) => Promise<number[]> }

describe('Create task', () => {
  beforeEach(() => {
    inMemoryTaskRepository = new InMemoryTaskRepository()
      ; (inMemoryTaskRepository as any).updateEmbedding = vi.fn().mockResolvedValue(undefined)

    openAiServiceMock = {
      createEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    }

    sut = new CreateTaskUseCase(
      inMemoryTaskRepository as any,
      openAiServiceMock as any,
    )
  })

  it('should be able to create a task', async () => {
    const authorId = new UniqueEntityID().toString()

    const result = await sut.execute({
      authorId,
      title: 'New task',
      description: 'Task description',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryTaskRepository.items).toHaveLength(1)
    expect(inMemoryTaskRepository.items[0].title).toBe('New task')
    expect(inMemoryTaskRepository.items[0].description).toBe('Task description')
    expect(inMemoryTaskRepository.items[0].priority).toBe(TaskPriority.MEDIUM)
    expect(inMemoryTaskRepository.items[0].status).toBe(TaskStatus.PENDING)
    expect(inMemoryTaskRepository.items[0].authorId.toString()).toBe(authorId)
    expect(openAiServiceMock.createEmbedding).toHaveBeenCalledTimes(1)
    const updateEmbeddingMock = (inMemoryTaskRepository as any).updateEmbedding
    expect(updateEmbeddingMock).toHaveBeenCalledTimes(1)
    expect(updateEmbeddingMock).toHaveBeenCalledWith(
      inMemoryTaskRepository.items[0].id.toString(),
      [0.1, 0.2, 0.3],
    )
  })

  it('should be able to create a task with default values', async () => {
    const authorId = new UniqueEntityID().toString()

    const result = await sut.execute({
      authorId,
      title: 'Task with defaults',
      description: 'Description',
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryTaskRepository.items).toHaveLength(1)

    const createdTask = inMemoryTaskRepository.items[0]
    expect(createdTask.title).toBe('Task with defaults')
    expect(createdTask.description).toBe('Description')
    expect(createdTask.priority).toBe(TaskPriority.HIGH)
    expect(createdTask.status).toBe(TaskStatus.IN_PROGRESS)
    expect(createdTask.createdAt).toBeInstanceOf(Date)
    expect(createdTask.slug.value).toBe('task-with-defaults')
  })

  it('should be able to create multiple tasks', async () => {
    const authorId = new UniqueEntityID().toString()

    await sut.execute({
      authorId,
      title: 'First task',
      description: 'First description',
      priority: TaskPriority.LOW,
      status: TaskStatus.PENDING,
    })

    await sut.execute({
      authorId,
      title: 'Second task',
      description: 'Second description',
      priority: TaskPriority.HIGH,
      status: TaskStatus.COMPLETED,
    })

    expect(inMemoryTaskRepository.items).toHaveLength(2)
    expect(inMemoryTaskRepository.items[0].title).toBe('First task')
    expect(inMemoryTaskRepository.items[1].title).toBe('Second task')
  })
})
