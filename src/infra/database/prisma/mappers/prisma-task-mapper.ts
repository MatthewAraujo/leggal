import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Task, TaskPriority, TaskStatus } from '@/domain/todo/enterprise/entities/task'
import { Prisma, Task as PrismaTask } from '@prisma/client'

export class PrismaTaskMapper {
	static toDomain(raw: PrismaTask): Task {
		return Task.create(
			{
				authorId: new UniqueEntityID(raw.authorId),
				description: raw.description,
				title: raw.title,
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
			priority: task.priority,
			status: task.status
		}
	}
}
