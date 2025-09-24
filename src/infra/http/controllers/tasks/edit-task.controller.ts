import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Param,
  Patch,
  UnauthorizedException,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { EditTaskUseCase } from '@/domain/todo/application/use-cases/task/edit/edit-task'
import { TaskPriority, TaskStatus } from '@/domain/todo/enterprise/entities/task'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger'
import { EditTasktDto } from '../../dtos/task/edit-task.dto'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'

const editTaskBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.string(),
  status: z.string()
})

const bodyValidationPipe = new ZodValidationPipe(editTaskBodySchema)

type EditTaskBodySchema = z.infer<typeof editTaskBodySchema>

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@Controller('/tasks/:id')
export class EditTaskController {
  constructor(private editTask: EditTaskUseCase) { }

  @Patch()
  @HttpCode(204)
  @ApiOperation({ summary: 'Editar tarefa por id' })
  @ApiParam({ name: 'id', required: true, description: 'ID da tarefa' })
  @ApiBody({ type: EditTasktDto })
  @ApiResponse({ status: 204, description: 'Tarefa atualizada com sucesso' })
  @ApiResponse({ status: 401, description: 'Usuário não autorizado a editar' })
  @ApiResponse({ status: 409, description: 'Tarefa não encontrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async handle(
    @Body(bodyValidationPipe) body: EditTaskBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('id') taskId: string,
  ) {
    const { title, description, priority, status } = body
    const userId = user.sub

    const result = await this.editTask.execute({
      description,
      priority: priority as TaskPriority,
      status: status as TaskStatus,
      title,
      authorId: userId,
      taskId

    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new ConflictException(error.message)
        case NotAllowedError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
