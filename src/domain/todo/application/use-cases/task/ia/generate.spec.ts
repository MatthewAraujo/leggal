import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { TaskPriority, TaskStatus } from '@/domain/todo/enterprise/entities/task'
import { InMemoryTaskRepository } from 'test/repositories/in-memory-task-repository'
import { vi } from 'vitest'
import { GenerateTaskUseCase } from './generate'

let inMemoryTaskRepository: InMemoryTaskRepository
let sut: GenerateTaskUseCase
let openAiServiceMock: {
	createCompletion: (prompt: string) => Promise<string>
	createEmbedding: (text: string) => Promise<number[]>
}
let aiCacheServiceMock: {
	getCachedResponse: (prompt: string) => Promise<string | null>
	setCachedResponse: (prompt: string, response: string, ttl: number) => Promise<void>
}

describe('Generate task', () => {
	beforeEach(() => {
		inMemoryTaskRepository = new InMemoryTaskRepository()
		;(inMemoryTaskRepository as any).updateEmbedding = vi.fn().mockResolvedValue(undefined)

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

		aiCacheServiceMock = {
			getCachedResponse: vi.fn().mockResolvedValue(null),
			setCachedResponse: vi.fn().mockResolvedValue(undefined),
		}

		sut = new GenerateTaskUseCase(
			inMemoryTaskRepository,
			openAiServiceMock as any,
			aiCacheServiceMock as any,
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

	it('should return error if OpenAI returns invalid JSON', async () => {
		;(openAiServiceMock.createCompletion as any).mockResolvedValueOnce('not-json')

		const result = await sut.execute({
			authorId: new UniqueEntityID().toString(),
			text: 'Broken AI response',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(Error)
	})

	it('should return error if OpenAI returns no response', async () => {
		;(openAiServiceMock.createCompletion as any).mockResolvedValueOnce(null)

		const result = await sut.execute({
			authorId: new UniqueEntityID().toString(),
			text: 'No response test',
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(Error)
	})

	it('should use cached response when available', async () => {
		const authorId = new UniqueEntityID().toString()
		const cachedResponse = JSON.stringify({
			title: 'Cached task',
			description: 'This is a cached response',
			priority: 'MEDIUM',
		})
		;(aiCacheServiceMock.getCachedResponse as any).mockResolvedValueOnce(cachedResponse)

		const result = await sut.execute({
			authorId,
			text: 'There is a bug in login with Google SSO',
		})

		expect(result.isRight()).toBe(true)
		expect(inMemoryTaskRepository.items).toHaveLength(1)

		const task = inMemoryTaskRepository.items[0]
		expect(task.title).toBe('Cached task')
		expect(task.description).toBe('This is a cached response')
		expect(task.priority).toBe(TaskPriority.MEDIUM)

		// OpenAI should not be called when cache is available
		expect(openAiServiceMock.createCompletion).not.toHaveBeenCalled()
		expect(aiCacheServiceMock.getCachedResponse).toHaveBeenCalledTimes(1)
	})
})
