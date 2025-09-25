import { TaskWithSameTitleError } from '@/domain/todo/application/use-cases/errors/task-with-same-title-error'
import { CreateTaskUseCase } from '@/domain/todo/application/use-cases/task/create/create-task'
import { TaskPriority, TaskStatus } from '@/domain/todo/enterprise/entities/task'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	HttpCode,
	Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { CreateTaskDto } from '../../dtos/task/create-task.dto'

const createTaskBodySchema = z.object({
	title: z.string(),
	description: z.string(),
	priority: z.string(),
	status: z.string(),
})

const bodyValidationPipe = new ZodValidationPipe(createTaskBodySchema)
type CreateTaskBodySchema = z.infer<typeof createTaskBodySchema>

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@Controller('/tasks')
export class CreateTaskController {
	constructor(private createTask: CreateTaskUseCase) {}

	@Post()
	@HttpCode(201)
	@ApiOperation({ summary: 'Criar nova tarefa' })
	@ApiBody({ type: CreateTaskDto })
	@ApiResponse({ status: 201, description: 'Tarefa criada com sucesso' })
	@ApiResponse({ status: 400, description: 'Dados inválidos' })
	async handle(
		@Body(bodyValidationPipe) body: CreateTaskBodySchema,
		@CurrentUser() user: UserPayload,
	) {
		const { title, description, priority, status } = body
		const authorId = user.sub

		const result = await this.createTask.execute({
			authorId,
			description,
			priority: priority as TaskPriority,
			status: status as TaskStatus,
			title,
		})

		if (result.isLeft()) {
			const error = result.value

			switch (error.constructor) {
				case TaskWithSameTitleError:
					throw new ConflictException(error.message)
				default:
					throw new BadRequestException()
			}
		}
	}
}
