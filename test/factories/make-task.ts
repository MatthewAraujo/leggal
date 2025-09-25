import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Task, TaskPriority, TaskProps, TaskStatus } from '@/domain/todo/enterprise/entities/task'

export function makeTask(override: Partial<TaskProps> = {}, id?: UniqueEntityID) {
	const task = Task.create(
		{
			authorId: new UniqueEntityID(),
			title: faker.lorem.sentence(),
			description: faker.lorem.paragraph(),
			priority: faker.helpers.enumValue(TaskPriority),
			status: faker.helpers.enumValue(TaskStatus),
			...override,
		},
		id,
	)

	return task
}
