import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Task, TaskPriority, TaskStatus } from '@/domain/todo/enterprise/entities/task'
import { Slug } from '@/domain/todo/enterprise/entities/value-objects/slug'
import { Prisma, Task as PrismaTask } from '@prisma/client'

export class PrismaTaskMapper {
	static toDomain(raw: PrismaTask): Task {
		return Task.create(
			{
				authorId: new UniqueEntityID(raw.authorId),
				description: raw.description,
				title: raw.title,
				slug: Slug.create(raw.slug),
				priority: TaskPriority[raw.priority],
				status: TaskStatus[raw.status]
			},
			new UniqueEntityID(raw.id),
		)
	}

	static toPrisma(task: Task): Prisma.TaskUncheckedCreateInput {
		return {
			id: task.id.toString(),
			authorId: task.authorId.toString(),
			description: task.description,
			title: task.title,
			slug: task.slug.value,
			priority: task.priority,
			status: task.status
		}
	}
}
