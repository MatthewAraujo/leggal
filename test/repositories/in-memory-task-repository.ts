import { DomainEvents } from '@/core/events/domain-events'
import { TasksRepository } from '@/domain/todo/application/repositories/task-repository'
import { Task } from '@/domain/todo/enterprise/entities/task'

export class InMemoryTaskRepository implements TasksRepository {

  public items: Task[] = []

  findByAuthorId(authorId: string): Promise<Task[]> {
    return Promise.resolve(this.items.filter((item) => item.authorId.toString() === authorId))
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
}
