import { FetchTasksUseCase } from '@/domain/todo/application/use-cases/task/get/get-tasks'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'
import { TaskPresenter } from '../../presenters/task-presenter'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@ApiTags('tasks')
@ApiBearerAuth('JWT-auth')
@Controller('/tasks')
export class FetchTasksController {
  constructor(private fetchTasks: FetchTasksUseCase) { }

  @Get()
  @ApiOperation({ summary: 'Listar tarefas do usuário autenticado (paginado)' })
  @ApiQuery({ name: 'page', required: false, description: 'Página (>= 1)', example: 1 })
  @ApiResponse({ status: 200, description: 'Lista de tarefas retornada com sucesso' })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub

    const result = await this.fetchTasks.execute({
      authorId: userId,
      page,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    const tasks = result.value.tasks

    return { tasks: tasks.map(TaskPresenter.toHTTP) }
  }
}
