import {
  BadRequestException,
  ConflictException,
  Controller,
  Delete,
  HttpCode,
  Param,
  UnauthorizedException,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { DeleteTaskUseCase } from '@/domain/todo/application/use-cases/task/delete/delete-task'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { DeleteTaskDto } from '../../dtos/task/delete-task.dto'


@ApiTags('tasks')
@Controller('/tasks/:id')
export class DeleteTaskController {
  constructor(private deleteTask: DeleteTaskUseCase) { }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Deletar Tarefa' })
  @ApiBody({ type: DeleteTaskDto })
  @ApiResponse({ status: 201, description: 'Deleted Task' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('id') taskId: string,
  ) {
    const userId = user.sub

    const result = await this.deleteTask.execute({
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
