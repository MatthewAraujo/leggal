import { Injectable } from '@nestjs/common'
import { Task } from '@/domain/todo/enterprise/entities/task'
import { TasksRepository } from '@/domain/todo/application/repositories/task-repository'
import { PrismaService } from '../prisma.service'
import { PrismaTaskMapper } from '../mappers/prisma-task-mapper'
import { PaginationParams } from '@/core/repositories/pagination-params'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Slug } from '@/domain/todo/enterprise/entities/value-objects/slug'
import { Prisma } from '@prisma/client'

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

  async updateEmbedding(taskId: string, embedding: number[]): Promise<void> {
    const vectorLiteral = `[${embedding.join(',')}]`
    await this.prisma.$executeRaw`
      UPDATE "tasks" SET embedding = ${vectorLiteral}::vector WHERE id = ${taskId}
    `
  }



  async findSimilarTasks(embedding: number[]): Promise<Task[]> {
    const embeddingValues = embedding.map((value) => Prisma.sql`${value}`)
    const embeddingVector = Prisma.sql`ARRAY[${Prisma.join(embeddingValues)}]::vector`

    const similarTasksRaw = await this.prisma.$queryRaw<
      {
        id: string
        title: string
        description: string
        priority: string
        status: string
        slug: string
        authorId: string
      }[]
    >(Prisma.sql`
    SELECT
      id,
      title,
      description,
      priority,
      status,
      slug,
      author_id AS "authorId"
    FROM tasks
    WHERE embedding IS NOT NULL
    ORDER BY embedding <-> ${embeddingVector} ASC
    LIMIT 5
  `)

    return similarTasksRaw.map((t) =>
      Task.create(
        {
          title: t.title,
          description: t.description,
          slug: Slug.createFromText(t.slug),
          priority: t.priority as any,
          status: t.status as any,
          authorId: new UniqueEntityID(t.authorId),
        },
        new UniqueEntityID(t.id),
      ),
    )
  }

}

