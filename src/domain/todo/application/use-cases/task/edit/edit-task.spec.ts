import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { TaskPriority, TaskStatus } from '@/domain/todo/enterprise/entities/task'
import { makeTask } from 'test/factories/make-task'
import { InMemoryTaskRepository } from 'test/repositories/in-memory-task-repository'
import { EditTaskUseCase } from './edit-task'

let inMemoryTaskRepository: InMemoryTaskRepository
let sut: EditTaskUseCase

describe('Edit task', () => {
	beforeEach(() => {
		inMemoryTaskRepository = new InMemoryTaskRepository()
		sut = new EditTaskUseCase(inMemoryTaskRepository)
	})

	it('should be able to edit a task', async () => {
		const authorId = new UniqueEntityID()
		const task = makeTask({ authorId })

		await inMemoryTaskRepository.create(task)

		const result = await sut.execute({
			taskId: task.id.toString(),
			authorId: authorId.toString(),
			title: 'Updated title',
			description: 'Updated description',
			priority: TaskPriority.HIGH,
			status: TaskStatus.COMPLETED,
		})

		expect(result.isRight()).toBe(true)
		if (result.isRight()) {
			const editedTask = result.value.task
			expect(editedTask.title).toBe('Updated title')
			expect(editedTask.description).toBe('Updated description')
			expect(editedTask.priority).toBe(TaskPriority.HIGH)
			expect(editedTask.status).toBe(TaskStatus.COMPLETED)
		}
	})

	it('should not be able to edit a non-existent task', async () => {
		const authorId = new UniqueEntityID()
		const nonExistentTaskId = new UniqueEntityID().toString()

		const result = await sut.execute({
			taskId: nonExistentTaskId,
			authorId: authorId.toString(),
			title: 'Title',
			description: 'Desc',
			priority: TaskPriority.MEDIUM,
			status: TaskStatus.PENDING,
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(ResourceNotFoundError)
	})

	it('should not be able to edit a task from another author', async () => {
		const authorId = new UniqueEntityID()
		const anotherAuthorId = new UniqueEntityID()
		const task = makeTask({ authorId })

		await inMemoryTaskRepository.create(task)

		const result = await sut.execute({
			taskId: task.id.toString(),
			authorId: anotherAuthorId.toString(),
			title: 'Title',
			description: 'Desc',
			priority: TaskPriority.MEDIUM,
			status: TaskStatus.PENDING,
		})

		expect(result.isLeft()).toBe(true)
		expect(result.value).toBeInstanceOf(NotAllowedError)
	})
})
