import { Task } from "@/domain/todo/enterprise/entities/task";

export class TaskPresenter {
	static toHTTP(task: Task) {
		return {
			id: task.id.toString(),
			title: task.title,
			slug: task.slug.value,
			content: task.content,
			createdAt: task.createdAt,
			updatedAt: task.updatedAt,
		}
	}
}
