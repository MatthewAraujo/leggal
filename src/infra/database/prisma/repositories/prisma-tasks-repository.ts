import { Injectable } from '@nestjs/common'
import { Task } from '@/domain/todo/enterprise/entities/task'
import { TasksRepository } from '@/domain/todo/application/repositories/task-repository'
import { PrismaService } from '../prisma.service'
import { PrismaTaskMapper } from '../mappers/prisma-task-mapper'
import { PaginationParams } from '@/core/repositories/pagination-params'

@Injectable()
export class PrismaTasksRepository implements TasksRepository {
  constructor(private prisma: PrismaService) { }

  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({ where: { id } })
    if (!task) return null

    return PrismaTaskMapper.toDomain(task)
  }

  async findAllByAuthorId(authorId: string, { page }: PaginationParams): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany(
      {
        where: { authorId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: (page - 1) * 20
      })
    return tasks.map(PrismaTaskMapper.toDomain)
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

    await this.prisma.task.update({
      where: {
        id: task.id.toString(),
      },
      data,
    })
  }

}

