import { Task } from "@/domain/todo/enterprise/entities/task";
import { Priority } from "@prisma/client";

export class TaskPresenter {
  static toHTTP(task: Task) {
    return {
      id: task.id.toString(),
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      authorId: task.authorId.toString(),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }
  }
}
