import { DomainEvents } from '@/core/events/domain-events'
import { TasksRepository } from '@/domain/todo/application/repositories/task-repository'
import { Task } from '@/domain/todo/enterprise/entities/task'

export class InMemoryTaskRepository implements TasksRepository {
  findSimilarTasks(embedding: number[]): Promise<Task[]> {
    throw new Error('Method not implemented.')
  }
  public items: Task[] = []

  findByAuthorId(authorId: string): Promise<Task[]> {
    return Promise.resolve(this.items.filter((item) => item.authorId.toString() === authorId))
  }

  findAllByAuthorId(id: string): Promise<Task[] | null> {
    throw new Error('Method not implemented.')
  }
  delete(task: Task): Promise<void> {
    const index = this.items.findIndex((item) => item.id === task.id)
    this.items.splice(index, 1)
    return Promise.resolve()
  }

  save(task: Task): Promise<void> {
    const index = this.items.findIndex((item) => item.id === task.id)
    this.items[index] = task
    return Promise.resolve()
  }


  async findById(id: string) {
    const task = this.items.find((item) => item.id.toString() === id)

    if (!task) {
      return null
    }

    return task
  }

  async create(task: Task) {
    this.items.push(task)

    DomainEvents.dispatchEventsForAggregate(task.id)
  }

  async updateEmbedding(taskId: string, embedding: number[]): Promise<void> {
    const task = await this.findById(taskId)
    if (!task) return
    // no-op for in-memory tests; we just ensure the method exists
    return
  }

  async findByTitle(title: string): Promise<Task | null> {
    const task = this.items.find((item) => item.title === title)
    if (!task) return null
    return task
  }
}
