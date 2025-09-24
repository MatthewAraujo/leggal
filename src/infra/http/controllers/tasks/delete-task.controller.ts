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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger'
import { DeleteTaskUseCase } from '@/domain/todo/application/use-cases/task/delete/delete-task'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'


@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@Controller('/tasks/:id')
export class DeleteTaskController {
  constructor(private deleteTask: DeleteTaskUseCase) { }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Deletar tarefa por id' })
  @ApiParam({ name: 'id', required: true, description: 'ID da tarefa' })
  @ApiResponse({ status: 204, description: 'Tarefa deletada com sucesso' })
  @ApiResponse({ status: 401, description: 'Usuário não autorizado a deletar' })
  @ApiResponse({ status: 409, description: 'Tarefa não encontrada' })
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
