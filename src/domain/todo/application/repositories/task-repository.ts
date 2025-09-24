import { PaginationParams } from '@/core/repositories/pagination-params';
import { Task } from '../../enterprise/entities/task'

export abstract class TasksRepository {
  abstract findById(id: string): Promise<Task | null>
  abstract findAllByAuthorId(id: string, { page }: PaginationParams): Promise<Task[] | null>
  abstract create(task: Task): Promise<void>
  abstract delete(task: Task): Promise<void>
  abstract save(task: Task): Promise<void>
}
