import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger'
import { z } from 'zod'
import { CreateTaskUseCase } from '@/domain/todo/application/use-cases/task/create/create-task'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { TaskPriority, TaskStatus } from '@/domain/todo/enterprise/entities/task'
import { CreateTaskDto } from '../../dtos/task/create-task.dto'

const createTaskBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.string(),
  status: z.string()
})

const bodyValidationPipe = new ZodValidationPipe(createTaskBodySchema)
type CreateTaskBodySchema = z.infer<typeof createTaskBodySchema>

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('/tasks')
export class CreateTaskController {
  constructor(private registerTask: CreateTaskUseCase) { }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Criar nova tarefa' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async handle(
    @Body(bodyValidationPipe) body: CreateTaskBodySchema,
    @CurrentUser() user: UserPayload
  ) {
    const { title, description, priority, status } = body
    const authorId = user.sub

    const result = await this.registerTask.execute({
      authorId,
      description,
      priority: priority as TaskPriority,
      status: status as TaskStatus,
      title,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
