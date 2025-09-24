import { Injectable } from '@nestjs/common'
import { Task } from '@/domain/todo/enterprise/entities/task'
import { TasksRepository } from '@/domain/todo/application/repositories/task-repository'
import { PrismaService } from '../prisma.service'
import { PrismaTaskMapper } from '../mappers/prisma-task-mapper'

@Injectable()
export class PrismaTasksRepository implements TasksRepository {
  constructor(private prisma: PrismaService) { }

  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({ where: { id } })
    if (!task) return null

    return PrismaTaskMapper.toDomain(task)
  }

  async findAllByAuthorId(authorId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({ where: { authorId } })
    return tasks.map(PrismaTaskMapper.toDomain)
  }

  async findByAuthorId(authorId: string): Promise<Task[]> {
    return this.findAllByAuthorId(authorId)
  }

  async create(task: Task): Promise<void> {
    const data = PrismaTaskMapper.toPrisma(task)

    await this.prisma.task.create({
      data,
    })
  }

  async delete(task: Task): Promise<void> {
    await this.prisma.task.delete({
      where: {
        id: task.id.toString(),
      },
    })
  }

  async save(task: Task): Promise<void> {
    const data = PrismaTaskMapper.toPrisma(task)

    this.prisma.task.update({
      where: {
        id: task.id.toString(),
      },
      data,
    })
  }

}

