import { InMemoryTaskRepository } from 'test/repositories/in-memory-task-repository'
import { DeleteTaskUseCase } from './delete-task'
import { makeTask } from 'test/factories/make-task'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'

let inMemoryTaskRepository: InMemoryTaskRepository
let sut: DeleteTaskUseCase

describe('Delete task', () => {
  beforeEach(() => {
    inMemoryTaskRepository = new InMemoryTaskRepository()
    sut = new DeleteTaskUseCase(inMemoryTaskRepository)
  })

  it('should be able to delete a task', async () => {
    const authorId = new UniqueEntityID()
    const task = makeTask({ authorId })

    await inMemoryTaskRepository.create(task)

    const result = await sut.execute({
      taskId: task.id.toString(),
      authorId: authorId.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(inMemoryTaskRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a non-existent task', async () => {
    const authorId = new UniqueEntityID().toString()
    const nonExistentTaskId = new UniqueEntityID().toString()

    const result = await sut.execute({
      taskId: nonExistentTaskId,
      authorId,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to delete a task from another author', async () => {
    const authorId = new UniqueEntityID()
    const anotherAuthorId = new UniqueEntityID()
    const task = makeTask({ authorId })

    await inMemoryTaskRepository.create(task)

    const result = await sut.execute({
      taskId: task.id.toString(),
      authorId: anotherAuthorId.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
    expect(inMemoryTaskRepository.items).toHaveLength(1)
  })

  it('should be able to delete multiple tasks from the same author', async () => {
    const authorId = new UniqueEntityID()
    const task1 = makeTask({ authorId })
    const task2 = makeTask({ authorId })

    await inMemoryTaskRepository.create(task1)
    await inMemoryTaskRepository.create(task2)

    expect(inMemoryTaskRepository.items).toHaveLength(2)

    // Delete first task
    const result1 = await sut.execute({
      taskId: task1.id.toString(),
      authorId: authorId.toString(),
    })

    expect(result1.isRight()).toBe(true)
    expect(inMemoryTaskRepository.items).toHaveLength(1)
    expect(inMemoryTaskRepository.items[0].id.toString()).toBe(task2.id.toString())

    // Delete second task
    const result2 = await sut.execute({
      taskId: task2.id.toString(),
      authorId: authorId.toString(),
    })

    expect(result2.isRight()).toBe(true)
    expect(inMemoryTaskRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a task that belongs to another author', async () => {
    const authorId = new UniqueEntityID()
    const anotherAuthorId = new UniqueEntityID()
    const task = makeTask({ authorId })

    await inMemoryTaskRepository.create(task)

    const result = await sut.execute({
      taskId: task.id.toString(),
      authorId: anotherAuthorId.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
    expect(inMemoryTaskRepository.items).toHaveLength(1)
    expect(inMemoryTaskRepository.items[0].id.toString()).toBe(task.id.toString())
  })
})
