
import { InMemoryTaskRepository } from 'test/repositories/in-memory-task-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { TaskPriority, TaskStatus } from '@/domain/todo/enterprise/entities/task'
import { vi } from 'vitest'
import { GenerateTaskUseCase } from './generate'

let inMemoryTaskRepository: InMemoryTaskRepository
let sut: GenerateTaskUseCase
let openAiServiceMock: {
  createCompletion: (prompt: string) => Promise<string>
  createEmbedding: (text: string) => Promise<number[]>
}

describe('Generate task', () => {
  beforeEach(() => {
    inMemoryTaskRepository = new InMemoryTaskRepository()
      ; (inMemoryTaskRepository as any).updateEmbedding = vi.fn().mockResolvedValue(undefined)

    openAiServiceMock = {
      createCompletion: vi.fn().mockResolvedValue(
        JSON.stringify({
          title: 'Fix login bug',
          description: 'Users are unable to log in with Google SSO',
          priority: 'HIGH',
        }),
      ),
      createEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    }

    sut = new GenerateTaskUseCase(
      inMemoryTaskRepository,
      openAiServiceMock as any,
    )
  })

  it('should generate a task from user text', async () => {
    const authorId = new UniqueEntityID().toString()

    const result = await sut.execute({
      authorId,
      text: 'There is a bug in login with Google SSO',
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryTaskRepository.items).toHaveLength(1)

    const task = inMemoryTaskRepository.items[0]
    expect(task.title).toBe('Fix login bug')
    expect(task.description).toBe('Users are unable to log in with Google SSO')
    expect(task.priority).toBe(TaskPriority.HIGH)
    expect(task.status).toBe(TaskStatus.PENDING)
    expect(task.authorId.toString()).toBe(authorId)

    expect(openAiServiceMock.createCompletion).toHaveBeenCalledTimes(1)
    expect(openAiServiceMock.createEmbedding).toHaveBeenCalledTimes(1)
    expect((inMemoryTaskRepository as any).updateEmbedding).toHaveBeenCalledWith(
      task.id.toString(),
      [0.1, 0.2, 0.3],
    )
  })

  it('should throw if OpenAI returns invalid JSON', async () => {
    ; (openAiServiceMock.createCompletion as any).mockResolvedValueOnce('not-json')

    await expect(
      sut.execute({
        authorId: new UniqueEntityID().toString(),
        text: 'Broken AI response',
      }),
    ).rejects.toThrow('Invalid JSON returned from OpenAI')
  })
})

